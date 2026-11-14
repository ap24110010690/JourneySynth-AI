// backend/src/utils/random.ts

// Simple reproducible pseudo-random number generator (Mulberry32)
export class PRNG {
  private s: number;

  constructor(seed?: number) {
    this.s = seed !== undefined ? seed >>> 0 : (Date.now() ^ (Math.random() * 0x100000000)) >>> 0;
  }

  // Returns float in [0, 1)
  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Returns integer in [min, max]
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Pick random item from array
  choice<T>(items: T[]): T {
    if (!items || items.length === 0) throw new Error('Cannot choose from empty array');
    return items[Math.floor(this.next() * items.length)];
  }

  // Weighted choice: items with numeric weights
  weightedChoice<T>(items: { item: T; weight: number }[]): T {
    const totalWeight = items.reduce((sum, i) => sum + Math.max(0, i.weight), 0);
    if (totalWeight <= 0) return items[0].item;

    let randomVal = this.next() * totalWeight;
    for (const entry of items) {
      if (randomVal < entry.weight) {
        return entry.item;
      }
      randomVal -= entry.weight;
    }
    return items[items.length - 1].item;
  }
}

// Generate realistic synthetic customer attributes
const FIRST_NAMES = [
  'Aarav', 'Emma', 'Liam', 'Olivia', 'Noah', 'Sophia', 'Lucas', 'Mia', 'Ethan', 'Isabella',
  'Mason', 'Harper', 'Alexander', 'Evelyn', 'James', 'Amelia', 'Benjamin', 'Charlotte', 'Priya',
  'Rohan', 'Ananya', 'Marcus', 'Chloe', 'Daniel', 'Aria', 'Kavya', 'Leo', 'Zoe', 'Elena', 'Vikram'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis',
  'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez',
  'Moore', 'Martin', 'Jackson', 'Verma', 'Mukherjee', 'Iyer', 'Reddy', 'Gupta', 'Chopra'
];

const CITIES = [
  'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Chicago, IL',
  'Bengaluru, IN', 'Mumbai, IN', 'London, UK', 'Toronto, CA', 'Berlin, DE',
  'Sydney, AU', 'Singapore, SG', 'Boston, MA', 'Denver, CO', 'Atlanta, GA'
];

const DEVICES = ['iPhone (iOS)', 'Samsung Galaxy (Android)', 'MacBook (Chrome)', 'Windows PC (Edge)', 'iPad (Safari)'];

export function generateSyntheticCustomerProfile(rng: PRNG, index: number) {
  const firstName = rng.choice(FIRST_NAMES);
  const lastName = rng.choice(LAST_NAMES);
  const name = `${firstName} ${lastName}`;
  const code = `CUST-${String(index + 1).padStart(5, '0')}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rng.nextInt(10, 99)}@synthretail.example`;
  const location = rng.choice(CITIES);
  const devicePreference = rng.choice(DEVICES);

  return {
    customerCode: code,
    name,
    email,
    location,
    devicePreference,
  };
}
