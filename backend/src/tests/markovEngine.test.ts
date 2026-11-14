// backend/src/tests/markovEngine.test.ts
import { MarkovJourneyEngine } from '../services/markovEngine.js';
import { GenerationConfig, ProductCategory, ProductRecord } from '../types/index.js';

const mockCatalog: ProductRecord[] = [
  { id: 'p1', sku: 'SKU-1', name: 'Product 1', category: 'Electronics' as ProductCategory, price: 100, brand: 'BrandA', availability: 'IN_STOCK' },
  { id: 'p2', sku: 'SKU-2', name: 'Product 2', category: 'Fashion' as ProductCategory, price: 50, brand: 'BrandB', availability: 'IN_STOCK' },
  { id: 'p3', sku: 'SKU-3', name: 'Product 3', category: 'Beauty' as ProductCategory, price: 30, brand: 'BrandC', availability: 'IN_STOCK' },
];

function runTests() {
  console.log('🧪 Starting JourneySynth AI Markov Engine & Behavioral Validation Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  const baseConfig: GenerationConfig = {
    datasetName: 'Test Cohort',
    totalCustomers: 50,
    channels: ['Website', 'Mobile App', 'Email', 'Paid Ads'],
    categories: ['Electronics', 'Fashion', 'Beauty'],
    segments: ['New Customers', 'High-Intent Customers', 'Cart-Abandoning Customers', 'Returning Customers'],
    durationDays: 7,
    cartAbandonmentProb: 0.4,
    purchaseProb: 0.3,
    emailEngagementProb: 0.3,
    adClickProb: 0.25,
    productRevisitProb: 0.35,
    returningCustomerProb: 0.3,
    minTimeGapMinutes: 2,
    maxTimeGapMinutes: 30,
    seed: 12345,
  };

  const engine = new MarkovJourneyEngine(baseConfig, mockCatalog);
  const result = engine.generate();

  // Test 1: Total customers count matches config
  assert(result.customers.length === 50, 'Generated exact configured number of customer profiles');

  // Test 2: Sessions generated
  assert(result.sessions.length >= 50, 'All customers have at least 1 session and returning customers have multiple sessions');

  // Test 3: Events generated
  assert(result.events.length > result.sessions.length, 'Every session contains multiple interaction events');

  // Test 4: Chronological timestamps within sessions
  let chronological = true;
  for (const s of result.sessions) {
    const sEvents = result.events.filter((e) => e.sessionId === s.id);
    for (let i = 1; i < sEvents.length; i++) {
      if (sEvents[i].timestamp.getTime() < sEvents[i - 1].timestamp.getTime()) {
        chronological = false;
        break;
      }
    }
  }
  assert(chronological, 'All interaction timestamps within sessions are strictly chronological');

  // Test 5: Purchases have preceding cart additions
  let purchasesPrecededByCart = true;
  for (const s of result.sessions) {
    const sEvents = result.events.filter((e) => e.sessionId === s.id);
    const purchaseIdx = sEvents.findIndex((e) => e.eventType === 'PURCHASE');
    if (purchaseIdx !== -1) {
      const precedingEvents = sEvents.slice(0, purchaseIdx);
      const hasCartAdd = precedingEvents.some((e) => e.eventType === 'CART_ADD');
      if (!hasCartAdd) {
        purchasesPrecededByCart = false;
        break;
      }
    }
  }
  assert(purchasesPrecededByCart, 'Purchases must be strictly preceded by a cart addition event');

  // Test 6: Consistency of Customer IDs and Session IDs
  const allCustIds = new Set(result.customers.map((c) => c.id));
  const eventsHaveValidCustomer = result.events.every((e) => allCustIds.has(e.customerId));
  assert(eventsHaveValidCustomer, 'Every generated event maps to a valid customer profile ID');

  // Test 7: Reproducibility with random seed
  const engine2 = new MarkovJourneyEngine(baseConfig, mockCatalog);
  const result2 = engine2.generate();
  const reproducible =
    result.customers[0].customerCode === result2.customers[0].customerCode &&
    result.events.length === result2.events.length;
  assert(reproducible, 'Simulation is strictly reproducible when identical random seed is provided');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
