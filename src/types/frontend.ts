// src/types/frontend.ts

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

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface GenerationConfig {
  datasetName: string;
  totalCustomers: number;
  channels: TouchpointChannel[];
  categories: ProductCategory[];
  segments: CustomerSegment[];
  durationDays: number;
  cartAbandonmentProb: number;
  purchaseProb: number;
  emailEngagementProb: number;
  adClickProb: number;
  productRevisitProb: number;
  returningCustomerProb: number;
  minTimeGapMinutes: number;
  maxTimeGapMinutes: number;
  seed?: number;
}

export interface Dataset {
  id: string;
  user_id: string;
  dataset_name: string;
  generation_config: string;
  total_customers: number;
  total_sessions: number;
  total_events: number;
  created_at: string;
}

export interface Customer {
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

export interface Session {
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

export interface JourneyEvent {
  id: string;
  dataset_id: string;
  customer_id: string;
  customer_code: string;
  customer_name: string;
  customer_type: CustomerSegment;
  session_id: string;
  session_code: string;
  conversion_status: string;
  product_id: string | null;
  product_name: string | null;
  product_category: string | null;
  product_price: number | null;
  event_type: JourneyState;
  channel: TouchpointChannel;
  event_timestamp: string;
  event_metadata: string | null;
}

export interface CustomerTimelineData {
  customer: Customer;
  sessions: Session[];
  metrics: {
    totalInteractions: number;
    totalSessions: number;
    channelsUsed: string[];
    productsViewed: string[];
    cartAdditions: number;
    purchaseStatus: 'COMPLETED' | 'NOT_COMPLETED';
    journeyDurationDays: number;
  };
  timeline: {
    dayIndex: number;
    date: string;
    events: JourneyEvent[];
  }[];
  rawEvents: JourneyEvent[];
}

export interface DatasetAnalytics {
  datasetId: string;
  datasetName: string;
  summary: {
    totalCustomers: number;
    totalSessions: number;
    totalEvents: number;
    purchaseConversionRate: number;
    cartAbandonmentRate: number;
    averageSessionDurationSec: number;
    totalRevenue: number;
  };
  channelDistribution: { channel: string; eventsCount: number; percentage: number }[];
  conversionFunnel: { stage: string; count: number; dropoffPercent: number }[];
  dropoffAnalysis: { step: string; retained: number; dropped: number; dropRate: number }[];
  purchaseVsAbandonment: { name: string; value: number }[];
  activityTrends: { date: string; events: number; purchases: number }[];
  categoryPerformance: { category: string; views: number; cartAdds: number; purchases: number; revenue: number }[];
  segmentBreakdown: { segment: string; customers: number; conversionRate: number }[];
  marketingEngagement: {
    ads: { impressions: number; clicks: number; ctr: number };
    email: { received: number; clicks: number; ctr: number };
  };
}

export interface DashboardStats {
  totalDatasets: number;
  totalCustomers: number;
  totalSessions: number;
  totalEvents: number;
  overallConversionRate: number;
  overallAbandonmentRate: number;
  recentDatasets: Dataset[];
  recentActivity: any[];
}
