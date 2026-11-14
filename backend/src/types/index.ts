// backend/src/types/index.ts

export type CustomerSegment =
  | 'New Customers'
  | 'Returning Customers'
  | 'High-Intent Customers'
  | 'Browsing Customers'
  | 'Discount-Seeking Customers'
  | 'Cart-Abandoning Customers';

export type TouchpointChannel = 'Website' | 'Mobile App' | 'Email' | 'Paid Ads';

export type ProductCategory =
  | 'Electronics'
  | 'Fashion'
  | 'Groceries'
  | 'Beauty'
  | 'Home Appliances'
  | 'Sports'
  | 'Books';

export type JourneyState =
  | 'START'
  | 'AD_IMPRESSION'
  | 'AD_CLICK'
  | 'WEBSITE_VISIT'
  | 'APP_VISIT'
  | 'PRODUCT_VIEW'
  | 'EMAIL_RECEIVED'
  | 'EMAIL_CLICK'
  | 'CART_ADD'
  | 'CART_REMOVE'
  | 'PURCHASE'
  | 'CHURN'
  | 'END';

export interface GenerationConfig {
  datasetName: string;
  totalCustomers: number;
  sessionsPerCustomer?: number;
  channels: TouchpointChannel[];
  categories: ProductCategory[];
  segments: CustomerSegment[];
  durationDays: number; // 1, 3, 7, 15, 30
  cartAbandonmentProb: number; // 0 to 1
  purchaseProb: number; // 0 to 1
  emailEngagementProb: number; // 0 to 1
  adClickProb: number; // 0 to 1
  productRevisitProb: number; // 0 to 1
  returningCustomerProb: number; // 0 to 1
  minTimeGapMinutes: number;
  maxTimeGapMinutes: number;
  seed?: number;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface DatasetRecord {
  id: string;
  user_id: string;
  dataset_name: string;
  generation_config: string;
  total_customers: number;
  total_sessions: number;
  total_events: number;
  created_at: string;
}

export interface CustomerRecord {
  id: string;
  dataset_id: string;
  customer_code: string;
  customer_type: CustomerSegment;
  customer_name: string;
  email: string;
  location: string;
  device_preference: string;
  created_at: string;
}

export interface SessionRecord {
  id: string;
  dataset_id: string;
  customer_id: string;
  session_code: string;
  channel: TouchpointChannel;
  started_at: string;
  ended_at: string;
  conversion_status: 'CONVERTED' | 'ABANDONED' | 'BROWSED';
  total_events: number;
}

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number;
  brand: string;
  availability: string;
}

export interface JourneyEventRecord {
  id: string;
  dataset_id: string;
  customer_id: string;
  session_id: string;
  product_id?: string | null;
  event_type: JourneyState;
  channel: TouchpointChannel;
  event_timestamp: string;
  event_metadata?: string | null;
}

export interface AiInsightRecord {
  id: string;
  dataset_id: string;
  insight_type: 'BEHAVIOUR_ANALYSIS' | 'PERSONA' | 'DROPOFF_QA';
  content: string;
  created_at: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: AuthUser;
}
