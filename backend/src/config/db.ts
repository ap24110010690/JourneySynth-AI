// backend/src/config/db.ts
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.resolve(__dirname, '../../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFilePath = path.join(dataDir, 'journeysynth.db');
console.log(`[DB] Initializing SQLite database at: ${dbFilePath}`);

export const db = new Database(dbFilePath);

// Enable foreign keys and WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS datasets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      dataset_name TEXT NOT NULL,
      generation_config TEXT NOT NULL,
      total_customers INTEGER NOT NULL DEFAULT 0,
      total_sessions INTEGER NOT NULL DEFAULT 0,
      total_events INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      dataset_id TEXT NOT NULL,
      customer_code TEXT NOT NULL,
      customer_type TEXT NOT NULL,
      customer_name TEXT,
      email TEXT,
      location TEXT,
      device_preference TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      dataset_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      session_code TEXT NOT NULL,
      channel TEXT NOT NULL,
      started_at DATETIME NOT NULL,
      ended_at DATETIME NOT NULL,
      conversion_status TEXT NOT NULL DEFAULT 'ABANDONED',
      total_events INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      brand TEXT NOT NULL,
      availability TEXT NOT NULL DEFAULT 'IN_STOCK'
    );

    CREATE TABLE IF NOT EXISTS journey_events (
      id TEXT PRIMARY KEY,
      dataset_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      product_id TEXT NULL,
      event_type TEXT NOT NULL,
      channel TEXT NOT NULL,
      event_timestamp DATETIME NOT NULL,
      event_metadata TEXT NULL,
      FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS ai_insights (
      id TEXT PRIMARY KEY,
      dataset_id TEXT NOT NULL,
      insight_type TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);
    CREATE INDEX IF NOT EXISTS idx_customers_dataset_id ON customers(dataset_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_dataset_id ON sessions(dataset_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_customer_id ON sessions(customer_id);
    CREATE INDEX IF NOT EXISTS idx_events_dataset_id ON journey_events(dataset_id);
    CREATE INDEX IF NOT EXISTS idx_events_customer_id ON journey_events(customer_id);
    CREATE INDEX IF NOT EXISTS idx_events_session_id ON journey_events(session_id);
    CREATE INDEX IF NOT EXISTS idx_events_product_id ON journey_events(product_id);
    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON journey_events(event_timestamp);
    CREATE INDEX IF NOT EXISTS idx_ai_insights_dataset_id ON ai_insights(dataset_id);
  `);

  seedProducts();
  console.log('[DB] Database tables and indexes verified successfully.');
}

// Seed realistic retail products
function seedProducts() {
  const count = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (count.count > 0) return;

  console.log('[DB] Seeding synthetic retail product catalog...');
  const insert = db.prepare(`
    INSERT INTO products (id, sku, name, category, price, brand, availability)
    VALUES (@id, @sku, @name, @category, @price, @brand, @availability)
  `);

  const initialProducts = [
    // Electronics
    { id: 'prod-elec-01', sku: 'ELEC-AP-001', name: 'AeroPulse Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 199.99, brand: 'SoundWave', availability: 'IN_STOCK' },
    { id: 'prod-elec-02', sku: 'ELEC-SM-002', name: 'Horizon Pro Ultra 5G Smartphone 256GB', category: 'Electronics', price: 899.00, brand: 'NexTel', availability: 'IN_STOCK' },
    { id: 'prod-elec-03', sku: 'ELEC-SW-003', name: 'PulseFit Titanium Smartwatch Series 7', category: 'Electronics', price: 249.50, brand: 'BioTrack', availability: 'IN_STOCK' },
    { id: 'prod-elec-04', sku: 'ELEC-4K-004', name: 'OLED CinemaVision 65-inch 4K Smart TV', category: 'Electronics', price: 1299.99, brand: 'LumixView', availability: 'IN_STOCK' },
    { id: 'prod-elec-05', sku: 'ELEC-LP-005', name: 'ZenithFlow Ultra-Slim Laptop 14-inch M3', category: 'Electronics', price: 1149.00, brand: 'ZenithTech', availability: 'IN_STOCK' },

    // Fashion
    { id: 'prod-fash-01', sku: 'FASH-JK-001', name: 'Urban Shield Waterproof Technical Parka', category: 'Fashion', price: 185.00, brand: 'NordicEdge', availability: 'IN_STOCK' },
    { id: 'prod-fash-02', sku: 'FASH-SN-002', name: 'CloudStride Minimalist Leather Sneakers', category: 'Fashion', price: 120.00, brand: 'Solestep', availability: 'IN_STOCK' },
    { id: 'prod-fash-03', sku: 'FASH-DN-003', name: 'Heritage Selvedge Slim-Taper Denim', category: 'Fashion', price: 95.00, brand: 'IndigoCraft', availability: 'IN_STOCK' },
    { id: 'prod-fash-04', sku: 'FASH-SW-004', name: 'Merino Wool Ribbed Crewneck Sweater', category: 'Fashion', price: 110.00, brand: 'AtelierKnit', availability: 'IN_STOCK' },
    { id: 'prod-fash-05', sku: 'FASH-AC-005', name: 'Italian Grain Leather Executive Briefcase', category: 'Fashion', price: 260.00, brand: 'Venezia', availability: 'IN_STOCK' },

    // Groceries
    { id: 'prod-groc-01', sku: 'GROC-CF-001', name: 'Artisan Single-Origin Ethiopian Yirgacheffe Beans', category: 'Groceries', price: 18.50, brand: 'RoastCraft', availability: 'IN_STOCK' },
    { id: 'prod-groc-02', sku: 'GROC-OL-002', name: 'Organic Cold-Pressed Extra Virgin Olive Oil 750ml', category: 'Groceries', price: 24.00, brand: 'TerraGreca', availability: 'IN_STOCK' },
    { id: 'prod-groc-03', sku: 'GROC-HN-003', name: 'Raw Wildflower Mountain Honey 500g', category: 'Groceries', price: 14.50, brand: 'AlpineApiary', availability: 'IN_STOCK' },
    { id: 'prod-groc-04', sku: 'GROC-MT-004', name: 'Ceremonial Grade Japanese Matcha Green Tea', category: 'Groceries', price: 29.00, brand: 'KyotoLeaves', availability: 'IN_STOCK' },
    { id: 'prod-groc-05', sku: 'GROC-SN-005', name: 'Organic Roasted Almond & Cranberry Trail Pack', category: 'Groceries', price: 9.75, brand: 'PureHarvest', availability: 'IN_STOCK' },

    // Beauty
    { id: 'prod-beau-01', sku: 'BEAU-SR-001', name: 'HydraGlow Hyaluronic Acid Vitamin C Serum', category: 'Beauty', price: 48.00, brand: 'Dermaceutic', availability: 'IN_STOCK' },
    { id: 'prod-beau-02', sku: 'BEAU-CR-002', name: 'Ceramide Peptide Botanical Barrier Cream', category: 'Beauty', price: 54.00, brand: 'LumiereSkin', availability: 'IN_STOCK' },
    { id: 'prod-beau-03', sku: 'BEAU-PF-003', name: 'Santal & Bergamot Eau de Parfum 50ml', category: 'Beauty', price: 115.00, brand: 'MaisonVerve', availability: 'IN_STOCK' },
    { id: 'prod-beau-04', sku: 'BEAU-MS-004', name: 'Bio-Cellulose Overnight Renewal Face Mask (5-Pack)', category: 'Beauty', price: 32.00, brand: 'K-Glow', availability: 'IN_STOCK' },
    { id: 'prod-beau-05', sku: 'BEAU-CL-005', name: 'Gentle Foaming Amino Acid Cleanser 200ml', category: 'Beauty', price: 26.50, brand: 'PureBotanics', availability: 'IN_STOCK' },

    // Home Appliances
    { id: 'prod-home-01', sku: 'HOME-ES-001', name: 'Barista Touch Espresso Machine with Steam Wand', category: 'Home Appliances', price: 599.00, brand: 'CaffeVeloce', availability: 'IN_STOCK' },
    { id: 'prod-home-02', sku: 'HOME-AF-002', name: 'Digital Vortex XL Dual-Zone Air Fryer 8.5L', category: 'Home Appliances', price: 159.00, brand: 'CrispMax', availability: 'IN_STOCK' },
    { id: 'prod-home-03', sku: 'HOME-VC-003', name: 'RoboClean LiDAR Precision Robot Vacuum & Mop', category: 'Home Appliances', price: 429.00, brand: 'NeuraHome', availability: 'IN_STOCK' },
    { id: 'prod-home-04', sku: 'HOME-BL-004', name: 'ProBlend High-Velocity Countertop Blender 1400W', category: 'Home Appliances', price: 179.00, brand: 'VigorMix', availability: 'IN_STOCK' },
    { id: 'prod-home-05', sku: 'HOME-AP-005', name: 'PureAir True HEPA Smart Air Purifier', category: 'Home Appliances', price: 189.00, brand: 'BreatheEase', availability: 'IN_STOCK' },

    // Sports
    { id: 'prod-spor-01', sku: 'SPOR-YM-001', name: 'EcoGrip High-Density Non-Slip Yoga Mat 6mm', category: 'Sports', price: 58.00, brand: 'AsanaForm', availability: 'IN_STOCK' },
    { id: 'prod-spor-02', sku: 'SPOR-DB-002', name: 'QuickLock Adjustable Dumbbell Set (5-52.5 lbs)', category: 'Sports', price: 349.00, brand: 'IronCore', availability: 'IN_STOCK' },
    { id: 'prod-spor-03', sku: 'SPOR-RB-003', name: 'HydroSpeed Aero Road Bike Carbon Helmet', category: 'Sports', price: 125.00, brand: 'VeloSpeed', availability: 'IN_STOCK' },
    { id: 'prod-spor-04', sku: 'SPOR-WB-004', name: 'Vacuum Insulated Stainless Steel Bottle 32oz', category: 'Sports', price: 34.00, brand: 'HydroPeak', availability: 'IN_STOCK' },
    { id: 'prod-spor-05', sku: 'SPOR-TR-005', name: 'Carbon Fiber Ultra-Light Trail Running Poles', category: 'Sports', price: 89.00, brand: 'SummitPath', availability: 'IN_STOCK' },

    // Books
    { id: 'prod-book-01', sku: 'BOOK-AI-001', name: 'Designing Machine Learning Systems: An Architectural Guide', category: 'Books', price: 44.99, brand: 'TechPress', availability: 'IN_STOCK' },
    { id: 'prod-book-02', sku: 'BOOK-DS-002', name: 'Customer Journey Analytics & Omnichannel Strategy', category: 'Books', price: 39.50, brand: 'AnalyticsHub', availability: 'IN_STOCK' },
    { id: 'prod-book-03', sku: 'BOOK-UX-003', name: 'Refactoring UI & Micro-Interactions in Modern SaaS', category: 'Books', price: 49.00, brand: 'DesignCraft', availability: 'IN_STOCK' },
    { id: 'prod-book-04', sku: 'BOOK-EC-004', name: 'The Retail Transformation: Algorithmic Merchandising', category: 'Books', price: 32.00, brand: 'GlobalCommerce', availability: 'IN_STOCK' },
    { id: 'prod-book-05', sku: 'BOOK-ST-005', name: 'Thinking in Probabilities: Markov Chains & Simulation', category: 'Books', price: 36.50, brand: 'AcademicMath', availability: 'IN_STOCK' },
  ];

  const transaction = db.transaction((products: typeof initialProducts) => {
    for (const p of products) {
      insert.run(p);
    }
  });

  transaction(initialProducts);
  console.log(`[DB] Successfully seeded ${initialProducts.length} retail products.`);
}
