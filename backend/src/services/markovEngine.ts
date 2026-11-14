// backend/src/services/markovEngine.ts
import {
  CustomerSegment,
  GenerationConfig,
  JourneyState,
  ProductCategory,
  ProductRecord,
  TouchpointChannel,
} from '../types/index.js';
import { PRNG, generateSyntheticCustomerProfile } from '../utils/random.js';
import crypto from 'crypto';

export interface GeneratedCustomer {
  id: string;
  customerCode: string;
  customerType: CustomerSegment;
  name: string;
  email: string;
  location: string;
  devicePreference: string;
}

export interface GeneratedSession {
  id: string;
  customerId: string;
  sessionCode: string;
  channel: TouchpointChannel;
  startedAt: Date;
  endedAt: Date;
  conversionStatus: 'CONVERTED' | 'ABANDONED' | 'BROWSED';
  totalEvents: number;
}

export interface GeneratedEvent {
  id: string;
  customerId: string;
  sessionId: string;
  productId: string | null;
  eventType: JourneyState;
  channel: TouchpointChannel;
  timestamp: Date;
  metadata: {
    productName?: string;
    productCategory?: string;
    productPrice?: number;
    campaignName?: string;
    cartValue?: number;
    durationSeconds?: number;
    referrer?: string;
  };
}

export interface GenerationResult {
  customers: GeneratedCustomer[];
  sessions: GeneratedSession[];
  events: GeneratedEvent[];
  stats: {
    totalCustomers: number;
    totalSessions: number;
    totalEvents: number;
    convertedSessions: number;
    abandonedSessions: number;
    conversionRate: number;
    abandonmentRate: number;
  };
}

// Markov transition matrices by customer segment with user-configured probabilities
export class MarkovJourneyEngine {
  private config: GenerationConfig;
  private rng: PRNG;
  private catalog: ProductRecord[];

  constructor(config: GenerationConfig, catalog: ProductRecord[]) {
    this.config = config;
    this.rng = new PRNG(config.seed);
    this.catalog = catalog.filter((p) => config.categories.includes(p.category));
    if (this.catalog.length === 0) {
      // Fallback if catalog filter was too restrictive
      this.catalog = catalog;
    }
  }

  // Generate full dataset of customer journeys
  public generate(): GenerationResult {
    const customers: GeneratedCustomer[] = [];
    const sessions: GeneratedSession[] = [];
    const events: GeneratedEvent[] = [];

    const now = Date.now();
    const durationMs = this.config.durationDays * 24 * 60 * 60 * 1000;
    const journeyStartTime = new Date(now - durationMs);

    for (let cIdx = 0; cIdx < this.config.totalCustomers; cIdx++) {
      const profile = generateSyntheticCustomerProfile(this.rng, cIdx);
      const segment = this.rng.choice(this.config.segments);

      const customerId = crypto.randomUUID();
      const customer: GeneratedCustomer = {
        id: customerId,
        customerCode: profile.customerCode,
        customerType: segment,
        name: profile.name,
        email: profile.email,
        location: profile.location,
        devicePreference: profile.devicePreference,
      };
      customers.push(customer);

      // Determine number of sessions for this customer
      let numSessions = 1;
      if (segment === 'Returning Customers' || this.rng.next() < this.config.returningCustomerProb) {
        numSessions = this.rng.nextInt(2, 4);
      } else if (segment === 'High-Intent Customers' && this.rng.next() < 0.4) {
        numSessions = 2;
      }

      // Customer baseline timeline offset
      const customerStartOffsetMs = this.rng.next() * (durationMs * 0.7);
      let currentTimelineCursor = new Date(journeyStartTime.getTime() + customerStartOffsetMs);

      // Select 1 to 3 preferred products for this customer to ensure consistency across sessions
      const customerPreferredProducts = this.pickCustomerProducts();

      for (let sIdx = 0; sIdx < numSessions; sIdx++) {
        const sessionId = crypto.randomUUID();
        const sessionCode = `SESS-${customer.customerCode.split('-')[1]}-${sIdx + 1}`;
        const sessionEvents: GeneratedEvent[] = [];

        // Pick primary channel for this session from selected channels
        const sessionChannel = this.selectChannelForSession(segment, sIdx);

        // Execute Markov chain state transitions for this session
        const outcome = this.simulateSessionJourney(
          customer,
          sessionId,
          sessionChannel,
          currentTimelineCursor,
          customerPreferredProducts
        );

        sessionEvents.push(...outcome.events);

        const startedAt = sessionEvents.length > 0 ? sessionEvents[0].timestamp : currentTimelineCursor;
        const endedAt = sessionEvents.length > 0 ? sessionEvents[sessionEvents.length - 1].timestamp : currentTimelineCursor;

        sessions.push({
          id: sessionId,
          customerId,
          sessionCode,
          channel: sessionChannel,
          startedAt,
          endedAt,
          conversionStatus: outcome.conversionStatus,
          totalEvents: sessionEvents.length,
        });

        events.push(...sessionEvents);

        // Advance timeline cursor for next session (e.g. 6 to 36 hours later)
        const sessionGapHours = this.rng.nextInt(6, 48);
        currentTimelineCursor = new Date(endedAt.getTime() + sessionGapHours * 60 * 60 * 1000);
      }
    }

    // Compute summary stats
    const totalCustomers = customers.length;
    const totalSessions = sessions.length;
    const totalEvents = events.length;
    const convertedSessions = sessions.filter((s) => s.conversionStatus === 'CONVERTED').length;
    const abandonedSessions = sessions.filter((s) => s.conversionStatus === 'ABANDONED').length;

    const conversionRate = totalSessions > 0 ? (convertedSessions / totalSessions) * 100 : 0;
    const sessionsWithCart = sessions.filter((s) => {
      const sEvents = events.filter((e) => e.sessionId === s.id);
      return sEvents.some((e) => e.eventType === 'CART_ADD');
    }).length;

    const abandonmentRate = sessionsWithCart > 0 ? (abandonedSessions / sessionsWithCart) * 100 : 0;

    return {
      customers,
      sessions,
      events,
      stats: {
        totalCustomers,
        totalSessions,
        totalEvents,
        convertedSessions,
        abandonedSessions,
        conversionRate: Math.round(conversionRate * 10) / 10,
        abandonmentRate: Math.round(abandonmentRate * 10) / 10,
      },
    };
  }

  private pickCustomerProducts(): ProductRecord[] {
    const pool = this.catalog.length > 0 ? this.catalog : [{ id: 'prod-fallback', sku: 'SKU-001', name: 'Retail Classic Product', category: 'Electronics' as ProductCategory, price: 99.99, brand: 'Acme', availability: 'IN_STOCK' }];
    const count = Math.min(3, pool.length);
    const chosen: ProductRecord[] = [];
    const available = [...pool];

    for (let i = 0; i < count; i++) {
      const idx = this.rng.nextInt(0, available.length - 1);
      chosen.push(available[idx]);
      available.splice(idx, 1);
    }
    return chosen;
  }

  private selectChannelForSession(segment: CustomerSegment, sessionIndex: number): TouchpointChannel {
    const available = this.config.channels;
    if (available.length === 1) return available[0];

    if (sessionIndex > 0 && available.includes('Email') && this.rng.next() < this.config.emailEngagementProb) {
      return 'Email';
    }

    if (available.includes('Paid Ads') && this.rng.next() < this.config.adClickProb && sessionIndex === 0) {
      return 'Paid Ads';
    }

    if (available.includes('Mobile App') && (available.includes('Website') ? this.rng.next() > 0.45 : true)) {
      return 'Mobile App';
    }

    return available.includes('Website') ? 'Website' : available[0];
  }

  // Simulate one session following the Markov chain model and transition probabilities
  private simulateSessionJourney(
    customer: GeneratedCustomer,
    sessionId: string,
    initialChannel: TouchpointChannel,
    startCursor: Date,
    preferredProducts: ProductRecord[]
  ): { events: GeneratedEvent[]; conversionStatus: 'CONVERTED' | 'ABANDONED' | 'BROWSED' } {
    const events: GeneratedEvent[] = [];
    let state: JourneyState = 'START';
    let currentChannel = initialChannel;
    let currentTime = new Date(startCursor.getTime());

    let activeProduct = preferredProducts[0];
    let cartHasProduct = false;
    let cartValue = 0;
    let stepCount = 0;
    const maxSteps = 15; // safeguard against runaway loops

    // Segment multipliers
    const seg = customer.customerType;
    let purchaseBoost = 1.0;
    let abandonBoost = 1.0;
    let browseBoost = 1.0;

    switch (seg) {
      case 'High-Intent Customers':
        purchaseBoost = 2.2;
        abandonBoost = 0.5;
        browseBoost = 0.7;
        break;
      case 'Cart-Abandoning Customers':
        purchaseBoost = 0.2;
        abandonBoost = 3.0;
        break;
      case 'Browsing Customers':
        purchaseBoost = 0.3;
        abandonBoost = 1.2;
        browseBoost = 2.5;
        break;
      case 'Discount-Seeking Customers':
        purchaseBoost = 1.3;
        abandonBoost = 1.4;
        break;
      case 'Returning Customers':
        purchaseBoost = 1.6;
        abandonBoost = 0.8;
        break;
      case 'New Customers':
      default:
        break;
    }

    // Determine the entry state from START
    state = this.getInitialState(currentChannel);

    while (state !== 'END' && stepCount < maxSteps) {
      stepCount++;

      // Advance clock by configured min-max time gap
      const gapSeconds = this.rng.nextInt(
        Math.max(1, this.config.minTimeGapMinutes * 60),
        Math.max(2, this.config.maxTimeGapMinutes * 60)
      );
      currentTime = new Date(currentTime.getTime() + gapSeconds * 1000);

      // Record event for current state
      const event: GeneratedEvent = {
        id: crypto.randomUUID(),
        customerId: customer.id,
        sessionId,
        productId: ['PRODUCT_VIEW', 'CART_ADD', 'CART_REMOVE', 'PURCHASE'].includes(state)
          ? activeProduct.id
          : null,
        eventType: state,
        channel: currentChannel,
        timestamp: new Date(currentTime.getTime()),
        metadata: {
          productName: ['PRODUCT_VIEW', 'CART_ADD', 'CART_REMOVE', 'PURCHASE'].includes(state)
            ? activeProduct.name
            : undefined,
          productCategory: ['PRODUCT_VIEW', 'CART_ADD', 'CART_REMOVE', 'PURCHASE'].includes(state)
            ? activeProduct.category
            : undefined,
          productPrice: ['PRODUCT_VIEW', 'CART_ADD', 'CART_REMOVE', 'PURCHASE'].includes(state)
            ? activeProduct.price
            : undefined,
          cartValue: cartHasProduct ? cartValue : undefined,
          durationSeconds: gapSeconds,
        },
      };

      if (state === 'CART_ADD') {
        cartHasProduct = true;
        cartValue += activeProduct.price;
        event.metadata.cartValue = cartValue;
      } else if (state === 'CART_REMOVE') {
        cartHasProduct = false;
        cartValue = Math.max(0, cartValue - activeProduct.price);
        event.metadata.cartValue = cartValue;
      } else if (state === 'PURCHASE') {
        event.metadata.cartValue = cartValue;
      }

      events.push(event);

      // Compute next state transition using Markov probabilities
      const nextTransition = this.getNextState(
        state,
        currentChannel,
        cartHasProduct,
        purchaseBoost,
        abandonBoost,
        browseBoost
      );

      state = nextTransition.nextState;
      if (nextTransition.switchChannel) {
        currentChannel = nextTransition.switchChannel;
      }

      // Check if product should be switched for product revisit / comparison
      if (state === 'PRODUCT_VIEW' && preferredProducts.length > 1 && this.rng.next() < 0.4) {
        activeProduct = this.rng.choice(preferredProducts);
      }
    }

    // Determine session conversion status
    const hasPurchase = events.some((e) => e.eventType === 'PURCHASE');
    const hasCartAdd = events.some((e) => e.eventType === 'CART_ADD');

    let conversionStatus: 'CONVERTED' | 'ABANDONED' | 'BROWSED' = 'BROWSED';
    if (hasPurchase) {
      conversionStatus = 'CONVERTED';
    } else if (hasCartAdd && cartHasProduct) {
      conversionStatus = 'ABANDONED';
    }

    return { events, conversionStatus };
  }

  // Get initial starting state based on entry channel
  private getInitialState(channel: TouchpointChannel): JourneyState {
    switch (channel) {
      case 'Paid Ads':
        return 'AD_IMPRESSION';
      case 'Email':
        return 'EMAIL_RECEIVED';
      case 'Mobile App':
        return 'APP_VISIT';
      case 'Website':
      default:
        return 'WEBSITE_VISIT';
    }
  }

  // Markov transition probabilities logic with behavioral rules
  private getNextState(
    current: JourneyState,
    currentChannel: TouchpointChannel,
    cartHasProduct: boolean,
    purchaseBoost: number,
    abandonBoost: number,
    browseBoost: number
  ): { nextState: JourneyState; switchChannel?: TouchpointChannel } {
    switch (current) {
      case 'AD_IMPRESSION': {
        const pClick = Math.min(0.85, this.config.adClickProb * 1.5);
        if (this.rng.next() < pClick) {
          return { nextState: 'AD_CLICK' };
        }
        return { nextState: 'CHURN' };
      }

      case 'AD_CLICK': {
        // Ad click routes to Website or Mobile App
        const targetChannel: TouchpointChannel = this.config.channels.includes('Website')
          ? 'Website'
          : this.config.channels.includes('Mobile App')
          ? 'Mobile App'
          : currentChannel;
        return {
          nextState: targetChannel === 'Mobile App' ? 'APP_VISIT' : 'WEBSITE_VISIT',
          switchChannel: targetChannel,
        };
      }

      case 'EMAIL_RECEIVED': {
        const pEmailClick = Math.min(0.75, this.config.emailEngagementProb * 1.4);
        if (this.rng.next() < pEmailClick) {
          return { nextState: 'EMAIL_CLICK' };
        }
        return { nextState: 'CHURN' };
      }

      case 'EMAIL_CLICK': {
        const targetChannel: TouchpointChannel = this.config.channels.includes('Website')
          ? 'Website'
          : this.config.channels.includes('Mobile App')
          ? 'Mobile App'
          : 'Website';
        return {
          nextState: targetChannel === 'Mobile App' ? 'APP_VISIT' : 'WEBSITE_VISIT',
          switchChannel: targetChannel,
        };
      }

      case 'WEBSITE_VISIT':
      case 'APP_VISIT': {
        // High likelihood of viewing a product
        const pChurn = 0.25 / browseBoost;
        if (this.rng.next() < pChurn) {
          return { nextState: 'CHURN' };
        }
        return { nextState: 'PRODUCT_VIEW' };
      }

      case 'PRODUCT_VIEW': {
        // Options: view another product, add to cart, or churn
        const pCartAdd = Math.min(0.7, 0.35 * purchaseBoost);
        const pRevisit = Math.min(0.5, this.config.productRevisitProb * browseBoost);

        const roll = this.rng.next();
        if (roll < pCartAdd) {
          return { nextState: 'CART_ADD' };
        } else if (roll < pCartAdd + pRevisit) {
          return { nextState: 'PRODUCT_VIEW' };
        } else {
          return { nextState: 'CHURN' };
        }
      }

      case 'CART_ADD': {
        // Crucial decision point: PURCHASE, CART_REMOVE, or CHURN (cart abandonment)
        const pPurchase = Math.min(0.85, this.config.purchaseProb * purchaseBoost);
        const pAbandon = Math.min(0.85, this.config.cartAbandonmentProb * abandonBoost);
        const pRemove = 0.12;

        const roll = this.rng.next();
        if (roll < pPurchase) {
          return { nextState: 'PURCHASE' };
        } else if (roll < pPurchase + pRemove) {
          return { nextState: 'CART_REMOVE' };
        } else {
          // Customer abandons cart and churns
          return { nextState: 'CHURN' };
        }
      }

      case 'CART_REMOVE': {
        // After removing, can view product again or churn
        if (this.rng.next() < 0.45 * browseBoost) {
          return { nextState: 'PRODUCT_VIEW' };
        }
        return { nextState: 'CHURN' };
      }

      case 'PURCHASE':
        return { nextState: 'END' };

      case 'CHURN':
        return { nextState: 'END' };

      case 'END':
      default:
        return { nextState: 'END' };
    }
  }
}
