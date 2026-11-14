// src/pages/AnalyticsPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { MetricCard } from '../components/MetricCard';
import { ChannelChart } from '../components/ChannelChart';
import { ConversionChart } from '../components/ConversionChart';
import { DropoffChart } from '../components/DropoffChart';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { datasetService } from '../services/datasetService';
import { analyticsService } from '../services/analyticsService';
import { Dataset, DatasetAnalytics } from '../types/frontend';
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Clock,
  DollarSign,
  Activity,
  Megaphone,
  Mail,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [analytics, setAnalytics] = useState<DatasetAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const allDatasets = await datasetService.getDatasets();
      setDatasets(allDatasets);

      if (allDatasets.length > 0) {
        const initialId = allDatasets[0].id;
        setSelectedDatasetId(initialId);
        const data = await analyticsService.getDatasetAnalytics(initialId);
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDatasetChange = async (id: string) => {
    setSelectedDatasetId(id);
    setLoading(true);
    try {
      const data = await analyticsService.getDatasetAnalytics(id);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to switch dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner message="Calculating journey analytics from stored events..." />
        </div>
      </div>
    );
  }

  if (datasets.length === 0 || !analytics) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopHeader title="Analytics & Insights" />
          <div className="p-6">
            <EmptyState
              icon={BarChart3}
              title="No Journey Data for Analytics"
              description="Analytics require at least one generated synthetic dataset to compute omnichannel metrics."
              actionText="Generate First Dataset"
              onAction={() => navigate('/generate')}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader
          title="Omnichannel Journey Analytics"
          subtitle={`Computed from ${analytics.summary.totalEvents.toLocaleString()} real stored synthetic events`}
          datasets={datasets}
          selectedDatasetId={selectedDatasetId}
          onSelectDataset={handleDatasetChange}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top KPI Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Purchase Conversion Rate"
              value={`${analytics.summary.purchaseConversionRate}%`}
              subtext="Converted sessions / Total sessions"
              icon={TrendingUp}
              trend={{ value: 'Target: >15%', isPositive: true }}
            />
            <MetricCard
              label="Cart Abandonment Rate"
              value={`${analytics.summary.cartAbandonmentRate}%`}
              subtext="Cart added without checkout"
              icon={ShoppingCart}
              trend={{ value: 'Loss friction', isPositive: false }}
            />
            <MetricCard
              label="Avg Session Duration"
              value={`${Math.floor(analytics.summary.averageSessionDurationSec / 60)}m ${analytics.summary.averageSessionDurationSec % 60}s`}
              subtext="Engagement time on site/app"
              icon={Clock}
            />
            <MetricCard
              label="Simulated Revenue"
              value={`$${analytics.summary.totalRevenue.toLocaleString()}`}
              subtext="Total completed order value"
              icon={DollarSign}
            />
          </div>

          {/* Marketing Channel Engagement (Ads & Email) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paid Ads Engagement Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Paid Advertisement Engagement</h3>
                    <p className="text-xs text-slate-500">Impressions vs Inbound Clicks</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-600">
                  CTR: {analytics.marketingEngagement.ads.ctr}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Impressions</span>
                  <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                    {analytics.marketingEngagement.ads.impressions}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Ad Clicks</span>
                  <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                    {analytics.marketingEngagement.ads.clicks}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Click Rate</span>
                  <span className="text-sm font-bold text-amber-600 font-mono tabular-nums">
                    {analytics.marketingEngagement.ads.ctr}%
                  </span>
                </div>
              </div>
            </div>

            {/* Email Marketing Engagement Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Email Marketing Engagement</h3>
                    <p className="text-xs text-slate-500">Promotions & Re-engagement sends</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-teal-600">
                  CTR: {analytics.marketingEngagement.email.ctr}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Delivered</span>
                  <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                    {analytics.marketingEngagement.email.received}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Email Clicks</span>
                  <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                    {analytics.marketingEngagement.email.clicks}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Click Rate</span>
                  <span className="text-sm font-bold text-teal-600 font-mono tabular-nums">
                    {analytics.marketingEngagement.email.ctr}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Funnel & Drop-off Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Conversion Funnel Stages</h3>
                <p className="text-xs text-slate-500">Volume progression across the synthetic purchase cycle</p>
              </div>
              <ConversionChart data={analytics.conversionFunnel} />
            </div>

            <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Step Drop-off & Loss</h3>
                <p className="text-xs text-slate-500">Retained shoppers vs churned visits at each state transition</p>
              </div>
              <DropoffChart data={analytics.dropoffAnalysis} />
            </div>
          </div>

          {/* Product Category Performance */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Retail Product Category Performance</h3>
                <p className="text-xs text-slate-500">Views, Cart Additions, and Purchases by retail vertical</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryPerformance} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow border border-slate-800">
                            <p className="font-semibold text-slate-100">{item.category}</p>
                            <p className="text-indigo-300 font-mono mt-1">Product Views: {item.views}</p>
                            <p className="text-sky-300 font-mono">Cart Adds: {item.cartAdds}</p>
                            <p className="text-emerald-400 font-mono">Purchases: {item.purchases}</p>
                            <p className="text-amber-300 font-mono">Revenue: ${item.revenue.toFixed(2)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="views" name="Product Views" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cartAdds" name="Cart Adds" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="purchases" name="Purchases" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Segment Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Customer Segment Behavioral Comparison</h3>
                <p className="text-xs text-slate-500">Conversion efficiency across synthesized shopper personas</p>
              </div>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-5">Customer Segment</th>
                  <th className="py-3 px-5">Customer Count</th>
                  <th className="py-3 px-5">Conversion Rate</th>
                  <th className="py-3 px-5">Behavioral Trait</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.segmentBreakdown.map((seg) => (
                  <tr key={seg.segment} className="hover:bg-slate-50/50">
                    <td className="py-3 px-5 font-semibold text-slate-900">{seg.segment}</td>
                    <td className="py-3 px-5 font-mono tabular-nums text-slate-700">{seg.customers}</td>
                    <td className="py-3 px-5 font-mono tabular-nums font-bold text-indigo-600">
                      {seg.conversionRate}%
                    </td>
                    <td className="py-3 px-5 text-slate-500">
                      {seg.segment === 'High-Intent Customers'
                        ? 'Rapid progression from search to cart checkout'
                        : seg.segment === 'Cart-Abandoning Customers'
                        ? 'Frequent drop-off after adding items to cart'
                        : seg.segment === 'Browsing Customers'
                        ? 'Extended exploration across multiple categories'
                        : seg.segment === 'Returning Customers'
                        ? 'Multi-session visits over multiple simulation days'
                        : 'Standard exploration dynamics'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};
