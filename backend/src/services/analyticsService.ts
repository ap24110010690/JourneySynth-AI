// backend/src/services/analyticsService.ts
import { db } from '../config/db.js';

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

export class AnalyticsService {
  public static getDatasetAnalytics(datasetId: string): DatasetAnalytics | null {
    const dataset = db.prepare('SELECT * FROM datasets WHERE id = ?').get(datasetId) as any;
    if (!dataset) return null;

    // 1. Sessions summary
    const sessions = db.prepare('SELECT * FROM sessions WHERE dataset_id = ?').all(datasetId) as any[];
    const events = db.prepare(`
      SELECT e.*, p.category as product_category, p.price as product_price
      FROM journey_events e
      LEFT JOIN products p ON e.product_id = p.id
      WHERE e.dataset_id = ?
    `).all(datasetId) as any[];

    const totalCustomers = dataset.total_customers;
    const totalSessions = sessions.length;
    const totalEvents = events.length;

    const convertedSessions = sessions.filter((s) => s.conversion_status === 'CONVERTED').length;
    const abandonedSessions = sessions.filter((s) => s.conversion_status === 'ABANDONED').length;

    const purchaseConversionRate = totalSessions > 0 ? (convertedSessions / totalSessions) * 100 : 0;

    // Cart abandonment: sessions that added to cart but did not purchase
    const sessionsWithCartSet = new Set(
      events.filter((e) => e.event_type === 'CART_ADD').map((e) => e.session_id)
    );
    const sessionsWithCartCount = sessionsWithCartSet.size;
    const cartAbandonmentRate =
      sessionsWithCartCount > 0 ? (abandonedSessions / sessionsWithCartCount) * 100 : 0;

    // Session durations
    let totalDurationSec = 0;
    for (const s of sessions) {
      const start = new Date(s.started_at).getTime();
      const end = new Date(s.ended_at).getTime();
      const diffSec = Math.max(1, (end - start) / 1000);
      totalDurationSec += diffSec;
    }
    const averageSessionDurationSec = totalSessions > 0 ? Math.round(totalDurationSec / totalSessions) : 0;

    // Total revenue from purchases
    const purchaseEvents = events.filter((e) => e.event_type === 'PURCHASE');
    let totalRevenue = 0;
    for (const pe of purchaseEvents) {
      totalRevenue += pe.product_price || 0;
    }

    // 2. Channel Distribution
    const channelCounts: Record<string, number> = {};
    for (const e of events) {
      channelCounts[e.channel] = (channelCounts[e.channel] || 0) + 1;
    }
    const channelDistribution = Object.entries(channelCounts).map(([channel, count]) => ({
      channel,
      eventsCount: count,
      percentage: totalEvents > 0 ? Math.round((count / totalEvents) * 1000) / 10 : 0,
    }));

    // 3. Conversion Funnel
    const visitCount = events.filter((e) => ['WEBSITE_VISIT', 'APP_VISIT'].includes(e.event_type)).length;
    const viewCount = events.filter((e) => e.event_type === 'PRODUCT_VIEW').length;
    const cartCount = events.filter((e) => e.event_type === 'CART_ADD').length;
    const purchaseCount = purchaseEvents.length;

    const conversionFunnel = [
      {
        stage: 'Website & App Visits',
        count: visitCount,
        dropoffPercent: 0,
      },
      {
        stage: 'Product Views',
        count: viewCount,
        dropoffPercent: visitCount > 0 ? Math.max(0, Math.round(((visitCount - viewCount) / visitCount) * 100)) : 0,
      },
      {
        stage: 'Cart Additions',
        count: cartCount,
        dropoffPercent: viewCount > 0 ? Math.max(0, Math.round(((viewCount - cartCount) / viewCount) * 100)) : 0,
      },
      {
        stage: 'Purchases Completed',
        count: purchaseCount,
        dropoffPercent: cartCount > 0 ? Math.max(0, Math.round(((cartCount - purchaseCount) / cartCount) * 100)) : 0,
      },
    ];

    // 4. Dropoff Analysis
    const dropoffAnalysis = [
      {
        step: 'Entry → Product Exploration',
        retained: viewCount,
        dropped: Math.max(0, visitCount - viewCount),
        dropRate: visitCount > 0 ? Math.round((Math.max(0, visitCount - viewCount) / visitCount) * 100) : 0,
      },
      {
        step: 'Product View → Cart Addition',
        retained: cartCount,
        dropped: Math.max(0, viewCount - cartCount),
        dropRate: viewCount > 0 ? Math.round((Math.max(0, viewCount - cartCount) / viewCount) * 100) : 0,
      },
      {
        step: 'Cart Addition → Checkout Purchase',
        retained: purchaseCount,
        dropped: Math.max(0, cartCount - purchaseCount),
        dropRate: cartCount > 0 ? Math.round((Math.max(0, cartCount - purchaseCount) / cartCount) * 100) : 0,
      },
    ];

    // 5. Purchase vs Abandonment
    const purchaseVsAbandonment = [
      { name: 'Completed Purchases', value: convertedSessions },
      { name: 'Cart Abandoned', value: abandonedSessions },
      { name: 'Browsed Only', value: Math.max(0, totalSessions - convertedSessions - abandonedSessions) },
    ];

    // 6. Activity trends over time (group by Day)
    const trendsMap: Record<string, { events: number; purchases: number }> = {};
    for (const e of events) {
      const day = e.event_timestamp ? e.event_timestamp.substring(0, 10) : 'Day 1';
      if (!trendsMap[day]) {
        trendsMap[day] = { events: 0, purchases: 0 };
      }
      trendsMap[day].events += 1;
      if (e.event_type === 'PURCHASE') {
        trendsMap[day].purchases += 1;
      }
    }

    const activityTrends = Object.entries(trendsMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        events: data.events,
        purchases: data.purchases,
      }));

    // 7. Product Category Performance
    const catMap: Record<string, { views: number; cartAdds: number; purchases: number; revenue: number }> = {};
    for (const e of events) {
      const cat = e.product_category || 'General';
      if (!catMap[cat]) {
        catMap[cat] = { views: 0, cartAdds: 0, purchases: 0, revenue: 0 };
      }
      if (e.event_type === 'PRODUCT_VIEW') catMap[cat].views++;
      if (e.event_type === 'CART_ADD') catMap[cat].cartAdds++;
      if (e.event_type === 'PURCHASE') {
        catMap[cat].purchases++;
        catMap[cat].revenue += e.product_price || 0;
      }
    }

    const categoryPerformance = Object.entries(catMap).map(([category, data]) => ({
      category,
      views: data.views,
      cartAdds: data.cartAdds,
      purchases: data.purchases,
      revenue: Math.round(data.revenue * 100) / 100,
    }));

    // 8. Segment Breakdown
    const customers = db.prepare('SELECT * FROM customers WHERE dataset_id = ?').all(datasetId) as any[];
    const segmentMap: Record<string, { customers: number; converted: number; total: number }> = {};
    for (const c of customers) {
      if (!segmentMap[c.customer_type]) {
        segmentMap[c.customer_type] = { customers: 0, converted: 0, total: 0 };
      }
      segmentMap[c.customer_type].customers++;
    }

    for (const s of sessions) {
      const customer = customers.find((c) => c.id === s.customer_id);
      if (customer && segmentMap[customer.customer_type]) {
        segmentMap[customer.customer_type].total++;
        if (s.conversion_status === 'CONVERTED') {
          segmentMap[customer.customer_type].converted++;
        }
      }
    }

    const segmentBreakdown = Object.entries(segmentMap).map(([segment, data]) => ({
      segment,
      customers: data.customers,
      conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 1000) / 10 : 0,
    }));

    // 9. Marketing Engagement
    const adImpressions = events.filter((e) => e.event_type === 'AD_IMPRESSION').length;
    const adClicks = events.filter((e) => e.event_type === 'AD_CLICK').length;
    const emailReceived = events.filter((e) => e.event_type === 'EMAIL_RECEIVED').length;
    const emailClicks = events.filter((e) => e.event_type === 'EMAIL_CLICK').length;

    const marketingEngagement = {
      ads: {
        impressions: adImpressions,
        clicks: adClicks,
        ctr: adImpressions > 0 ? Math.round((adClicks / adImpressions) * 1000) / 10 : 0,
      },
      email: {
        received: emailReceived,
        clicks: emailClicks,
        ctr: emailReceived > 0 ? Math.round((emailClicks / emailReceived) * 1000) / 10 : 0,
      },
    };

    return {
      datasetId,
      datasetName: dataset.dataset_name,
      summary: {
        totalCustomers,
        totalSessions,
        totalEvents,
        purchaseConversionRate: Math.round(purchaseConversionRate * 10) / 10,
        cartAbandonmentRate: Math.round(cartAbandonmentRate * 10) / 10,
        averageSessionDurationSec,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      },
      channelDistribution,
      conversionFunnel,
      dropoffAnalysis,
      purchaseVsAbandonment,
      activityTrends,
      categoryPerformance,
      segmentBreakdown,
      marketingEngagement,
    };
  }

  // Aggregate stats across all datasets for a user (for the Main Dashboard)
  public static getUserDashboardStats(userId: string) {
    const datasets = db.prepare('SELECT * FROM datasets WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];

    if (datasets.length === 0) {
      return {
        totalDatasets: 0,
        totalCustomers: 0,
        totalSessions: 0,
        totalEvents: 0,
        overallConversionRate: 0,
        overallAbandonmentRate: 0,
        recentDatasets: [],
        recentActivity: [],
      };
    }

    const totalDatasets = datasets.length;
    const totalCustomers = datasets.reduce((sum, d) => sum + (d.total_customers || 0), 0);
    const totalSessions = datasets.reduce((sum, d) => sum + (d.total_sessions || 0), 0);
    const totalEvents = datasets.reduce((sum, d) => sum + (d.total_events || 0), 0);

    // Get aggregated sessions
    const datasetIds = datasets.map((d) => `'${d.id}'`).join(',');
    const sessions = db.prepare(`SELECT * FROM sessions WHERE dataset_id IN (${datasetIds})`).all() as any[];
    const converted = sessions.filter((s) => s.conversion_status === 'CONVERTED').length;
    const abandoned = sessions.filter((s) => s.conversion_status === 'ABANDONED').length;

    const overallConversionRate = totalSessions > 0 ? Math.round((converted / totalSessions) * 1000) / 10 : 0;
    const overallAbandonmentRate =
      converted + abandoned > 0 ? Math.round((abandoned / (converted + abandoned)) * 1000) / 10 : 0;

    const recentEvents = db.prepare(`
      SELECT e.*, c.customer_code, c.customer_name, p.name as product_name
      FROM journey_events e
      JOIN customers c ON e.customer_id = c.id
      LEFT JOIN products p ON e.product_id = p.id
      WHERE e.dataset_id IN (${datasetIds})
      ORDER BY e.event_timestamp DESC
      LIMIT 10
    `).all() as any[];

    return {
      totalDatasets,
      totalCustomers,
      totalSessions,
      totalEvents,
      overallConversionRate,
      overallAbandonmentRate,
      recentDatasets: datasets.slice(0, 5),
      recentActivity: recentEvents,
    };
  }
}
