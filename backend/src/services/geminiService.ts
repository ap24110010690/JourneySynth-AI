// backend/src/services/geminiService.ts
import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env.js';
import { AnalyticsService } from './analyticsService.js';
import { EventModel } from '../models/eventModel.js';
import { CustomerModel } from '../models/customerModel.js';
import { db } from '../config/db.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!ENV.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: ENV.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export class GeminiService {
  /**
   * Feature A: AI Behaviour Analysis of a Dataset
   */
  public static async analyzeDataset(datasetId: string): Promise<{
    source: 'gemini' | 'rule_based_fallback';
    report: string;
    metricsSummary: any;
  }> {
    const analytics = AnalyticsService.getDatasetAnalytics(datasetId);
    if (!analytics) {
      throw new Error('Dataset not found');
    }

    const ai = getAiClient();
    const metricsSummary = {
      datasetName: analytics.datasetName,
      totalCustomers: analytics.summary.totalCustomers,
      totalSessions: analytics.summary.totalSessions,
      totalEvents: analytics.summary.totalEvents,
      conversionRate: `${analytics.summary.purchaseConversionRate}%`,
      abandonmentRate: `${analytics.summary.cartAbandonmentRate}%`,
      totalRevenue: `$${analytics.summary.totalRevenue.toLocaleString()}`,
      channelShare: analytics.channelDistribution.map((c) => `${c.channel}: ${c.percentage}%`).join(', '),
      topCategories: analytics.categoryPerformance.map((c) => `${c.category} ($${c.revenue} rev)`).join(', '),
      dropoffs: analytics.dropoffAnalysis.map((d) => `${d.step}: ${d.dropRate}% drop`).join(', '),
    };

    if (!ai) {
      // Rule-based statistical fallback when GEMINI_API_KEY is not provided
      const fallbackReport = `### Executive Behaviour Analysis (${analytics.datasetName})
*Generated via statistical engine (Gemini API key not configured in environment)*

#### 1. Conversion & Cart Funnel Performance
- **Purchase Conversion Rate:** The dataset achieved an overall conversion rate of **${analytics.summary.purchaseConversionRate}%** across ${analytics.summary.totalSessions} sessions.
- **Cart Abandonment Rate:** **${analytics.summary.cartAbandonmentRate}%** of shoppers who placed items into their shopping carts abandoned their session without finalizing checkout.
- **Primary Drop-off Stage:** The most significant friction point occurred at: **${analytics.dropoffAnalysis[1]?.step || 'Product to Cart'}** with a **${analytics.dropoffAnalysis[1]?.dropRate || 0}%** loss rate.

#### 2. Omnichannel Engagement
- **Channel Distribution:** ${metricsSummary.channelShare}.
- **Ad & Email Traction:** Paid ads and re-engagement emails generated significant initial visits, but cross-channel attribution shows higher intent when users transition to the Web and Mobile App store.

#### 3. Strategic Recommendations
1. **Targeted Checkout Nudges:** Deploy exit-intent promotions or automated cart-recovery reminders within 2 hours of cart addition.
2. **Personalized Category Carousels:** Increase prominence of top revenue categories (${analytics.categoryPerformance.slice(0, 2).map((c) => c.category).join(', ')}).
3. **Omnichannel Continuity:** Synchronize cart items seamlessly between mobile app sessions and website visits.`;

      return {
        source: 'rule_based_fallback',
        report: fallbackReport,
        metricsSummary,
      };
    }

    try {
      const prompt = `You are a senior principal retail data scientist and e-commerce conversion optimization expert.
Analyze the following synthetic customer journey dataset:

Dataset Name: ${analytics.datasetName}
Total Customers: ${analytics.summary.totalCustomers}
Total Sessions: ${analytics.summary.totalSessions}
Total Events: ${analytics.summary.totalEvents}
Purchase Conversion Rate: ${analytics.summary.purchaseConversionRate}%
Cart Abandonment Rate: ${analytics.summary.cartAbandonmentRate}%
Total Simulated Revenue: $${analytics.summary.totalRevenue}
Channel Distribution: ${metricsSummary.channelShare}
Category Performance: ${metricsSummary.topCategories}
Funnel Drop-offs: ${metricsSummary.dropoffs}

Strict Grounding Rules:
- All numerical claims MUST be grounded in the numbers provided above. Do not invent contradictory statistics.
- Structure your output in clear markdown with sections:
  1. Executive Summary & Conversion Health
  2. Drop-off & Cart Abandonment Root Causes
  3. Channel Performance & Omnichannel Synergies
  4. Prescriptive Action Plan for Personalization & Recommendation Models
- Keep tone professional, analytical, and actionable.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const report = response.text || 'No response generated from Gemini.';
      return {
        source: 'gemini',
        report,
        metricsSummary,
      };
    } catch (err: any) {
      console.error('[Gemini API Error]', err);
      return {
        source: 'rule_based_fallback',
        report: `### Executive Behaviour Analysis (Statistical Fallback)
*Gemini API request failed (${err.message || 'error'}). Provided standard statistical analysis.*

- **Conversion Rate:** ${analytics.summary.purchaseConversionRate}%
- **Cart Abandonment:** ${analytics.summary.cartAbandonmentRate}%
- **Total Revenue:** $${analytics.summary.totalRevenue}
- **Drop-off Point:** Primary bottleneck is at ${analytics.dropoffAnalysis[1]?.step || 'Cart Stage'} with ${analytics.dropoffAnalysis[1]?.dropRate || 0}% drop rate.`,
        metricsSummary,
      };
    }
  }

  /**
   * Feature B: AI Customer Persona Generation for a Customer
   */
  public static async generateCustomerPersona(customerId: string): Promise<{
    source: 'gemini' | 'rule_based_fallback';
    persona: any;
  }> {
    const customer = CustomerModel.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const timeline = EventModel.findByCustomerId(customerId);
    const channelsUsed = Array.from(new Set(timeline.map((e) => e.channel)));
    const productsInteracted = Array.from(
      new Set(timeline.filter((e) => e.product_name).map((e) => `${e.product_name} (${e.product_category})`))
    );
    const converted = timeline.some((e) => e.event_type === 'PURCHASE');
    const abandonedCart = timeline.some((e) => e.event_type === 'CART_ADD') && !converted;

    const journeyContext = {
      customerCode: customer.customer_code,
      name: customer.customer_name,
      segment: customer.customer_type,
      location: customer.location,
      device: customer.device_preference,
      totalInteractions: timeline.length,
      channels: channelsUsed.join(', '),
      products: productsInteracted.join('; '),
      converted,
      abandonedCart,
      eventSequence: timeline.map((e) => `[${e.channel}] ${e.event_type} - ${e.product_name || 'N/A'}`).join(' -> '),
    };

    const ai = getAiClient();

    if (!ai) {
      // High-quality rule-based persona fallback
      const fallbackPersona = {
        name: customer.customer_name,
        code: customer.customer_code,
        archetype: `${customer.customer_type} / ${converted ? 'Active Buyer' : abandonedCart ? 'Hesitant Shopper' : 'Casual Explorer'}`,
        demographics: `Location: ${customer.location} · Primary Device: ${customer.device_preference}`,
        shoppingStyle: converted
          ? 'Decisive shopper influenced by product clarity and streamlined checkout.'
          : 'Comparison-heavy evaluator requiring price assurance and social proof.',
        browsingBehavior: `Interacted across ${channelsUsed.length} touchpoints (${channelsUsed.join(', ')}). Generated ${timeline.length} distinct events.`,
        productInterests: productsInteracted.length > 0 ? productsInteracted : ['General retail catalog'],
        motivationOrFriction: converted
          ? 'High product relevance matched price expectations, leading to completed order.'
          : abandonedCart
          ? 'Added items to cart but dropped off during checkout, possibly seeking discount or shipping transparency.'
          : 'Window shopping exploratory behavior without immediate purchasing urgency.',
        recommendations: [
          'Recommend complementary accessories for viewed products.',
          'Trigger targeted email notification with exclusive 10% coupon for abandoned categories.',
          'Optimize mobile page load speeds to prevent bounce rates.',
        ],
        disclaimer: 'Synthetic AI-Generated Interpretation for Model Testing',
      };

      return {
        source: 'rule_based_fallback',
        persona: fallbackPersona,
      };
    }

    try {
      const prompt = `You are a consumer behavioral psychologist and personalization model designer.
Create a rich, realistic customer persona for this synthetic shopper based on their actual synthetic journey:

Customer Code: ${customer.customer_code}
Name: ${customer.customer_name}
Segment: ${customer.customer_type}
Location: ${customer.location}
Device: ${customer.device_preference}
Channels Used: ${journeyContext.channels}
Products Interacted: ${journeyContext.products}
Outcome: ${converted ? 'Purchased' : abandonedCart ? 'Cart Abandoned' : 'Browsed Only'}
Event Flow: ${journeyContext.eventSequence}

Return a valid JSON object matching this structure:
{
  "name": "${customer.customer_name}",
  "code": "${customer.customer_code}",
  "archetype": "Descriptive persona title (e.g., The Methodical Tech Enthusiast)",
  "demographics": "Summary of location, lifestyle, and device preference",
  "shoppingStyle": "1-2 sentences on their shopping habits and cognitive patterns",
  "browsingBehavior": "Analysis of their channel switching and session flow",
  "productInterests": ["Array of key product interests"],
  "motivationOrFriction": "Why they purchased or what friction caused them to drop off",
  "recommendations": ["3 specific personalization/recommendation engine suggestions"],
  "disclaimer": "Synthetic AI-Generated Interpretation for Model Testing"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        source: 'gemini',
        persona: parsed,
      };
    } catch (err: any) {
      console.error('[Gemini Persona Error]', err);
      return {
        source: 'rule_based_fallback',
        persona: {
          name: customer.customer_name,
          code: customer.customer_code,
          archetype: `${customer.customer_type} Shopper`,
          demographics: `${customer.location} · ${customer.device_preference}`,
          shoppingStyle: 'Synthetic profile derived from behavioral events.',
          browsingBehavior: `Observed across ${channelsUsed.join(', ')}.`,
          productInterests: productsInteracted,
          motivationOrFriction: converted ? 'Purchase completed.' : 'Cart abandoned or session ended.',
          recommendations: ['Deliver tailored product recommendations based on viewed categories.'],
          disclaimer: 'Synthetic AI-Generated Interpretation for Model Testing',
        },
      };
    }
  }

  /**
   * Feature C: AI Drop-off Q&A for a Dataset
   */
  public static async answerQuestion(
    datasetId: string,
    question: string
  ): Promise<{
    source: 'gemini' | 'rule_based_fallback';
    answer: string;
  }> {
    const analytics = AnalyticsService.getDatasetAnalytics(datasetId);
    if (!analytics) {
      throw new Error('Dataset not found');
    }

    const ai = getAiClient();

    if (!ai) {
      // Deterministic answer based on exact statistics
      const qLower = question.toLowerCase();
      let answer = '';

      if (qLower.includes('cart') || qLower.includes('abandon')) {
        answer = `In this dataset (${analytics.datasetName}), the cart abandonment rate is ${analytics.summary.cartAbandonmentRate}%. Out of all sessions where products were placed in carts, ${analytics.dropoffAnalysis[2]?.dropped || 0} sessions did not complete checkout. Key contributing factors in synthetic simulation include high price sensitivity among discount-seeking segments and missing checkout incentives.`;
      } else if (qLower.includes('channel') || qLower.includes('highest')) {
        const topChannel = [...analytics.channelDistribution].sort((a, b) => b.eventsCount - a.eventsCount)[0];
        answer = `Based on stored dataset interactions, the most active channel is **${topChannel?.channel || 'Website'}** representing **${topChannel?.percentage || 0}%** of total events (${topChannel?.eventsCount || 0} interactions). For conversion, direct web and mobile app touchpoints exhibit the highest checkout closure rate.`;
      } else if (qLower.includes('improve') || qLower.includes('conversion')) {
        answer = `Currently, the overall purchase conversion rate is **${analytics.summary.purchaseConversionRate}%** with **${analytics.summary.totalRevenue}** in total generated revenue. To improve conversion: 1) Address the ${analytics.dropoffAnalysis[1]?.dropRate || 0}% drop-off between product view and cart addition; 2) Introduce personalized recommendation bundles on top categories (${analytics.categoryPerformance.slice(0, 2).map((c) => c.category).join(', ')}); 3) Retarget abandoned carts via automated email engagement.`;
      } else {
        answer = `Dataset **${analytics.datasetName}** generated ${analytics.summary.totalCustomers} customers, ${analytics.summary.totalSessions} sessions, and ${analytics.summary.totalEvents} events with a ${analytics.summary.purchaseConversionRate}% conversion rate and ${analytics.summary.cartAbandonmentRate}% cart abandonment rate across ${analytics.channelDistribution.length} channels.`;
      }

      return {
        source: 'rule_based_fallback',
        answer,
      };
    }

    try {
      const prompt = `You are an expert retail data consultant answering questions about an omnichannel customer journey dataset:

Dataset Name: ${analytics.datasetName}
Total Customers: ${analytics.summary.totalCustomers}
Total Sessions: ${analytics.summary.totalSessions}
Total Events: ${analytics.summary.totalEvents}
Conversion Rate: ${analytics.summary.purchaseConversionRate}%
Cart Abandonment Rate: ${analytics.summary.cartAbandonmentRate}%
Revenue: $${analytics.summary.totalRevenue}
Channel Breakdown: ${analytics.channelDistribution.map((c) => `${c.channel} (${c.percentage}%)`).join(', ')}
Funnel Drop-offs: ${analytics.dropoffAnalysis.map((d) => `${d.step}: ${d.dropRate}% drop`).join(', ')}
Category Highlights: ${analytics.categoryPerformance.map((c) => `${c.category} ($${c.revenue})`).join(', ')}

User Question: "${question}"

Provide a direct, factual, data-grounded response. Reference the exact numbers where applicable.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return {
        source: 'gemini',
        answer: response.text || 'Unable to generate response.',
      };
    } catch (err: any) {
      console.error('[Gemini Q&A Error]', err);
      return {
        source: 'rule_based_fallback',
        answer: `Analysis based on stored metrics: Conversion rate is ${analytics.summary.purchaseConversionRate}%, cart abandonment is ${analytics.summary.cartAbandonmentRate}%, and highest drop-off occurs at ${analytics.dropoffAnalysis[1]?.step || 'Cart Stage'}.`,
      };
    }
  }
}
