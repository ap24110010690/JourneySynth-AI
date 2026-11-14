// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { Dataset, DashboardStats, DatasetAnalytics } from '../types/frontend';
import {
  Users,
  Layers,
  Activity,
  TrendingUp,
  ShoppingCart,
  Database,
  ArrowRight,
  Sparkles,
  PieChart as PieIcon,
  Clock,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const PIE_COLORS = ['#10b981', '#f43f5e', '#64748b'];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [activeAnalytics, setActiveAnalytics] = useState<DatasetAnalytics | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashStats, allDatasets] = await Promise.all([
        datasetService.getDashboardStats(),
        datasetService.getDatasets(),
      ]);

      setStats(dashStats);
      setDatasets(allDatasets);

      if (allDatasets.length > 0) {
        const defaultId = allDatasets[0].id;
        setSelectedDatasetId(defaultId);
        const analytics = await analyticsService.getDatasetAnalytics(defaultId);
        setActiveAnalytics(analytics);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDataset = async (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    try {
      const analytics = await analyticsService.getDatasetAnalytics(datasetId);
      setActiveAnalytics(analytics);
    } catch (err) {
      console.error('Failed to switch dataset analytics:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner message="Loading JourneySynth Intelligence..." />
        </div>
      </div>
    );
  }

  const hasData = datasets.length > 0 && stats && stats.totalDatasets > 0;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader
          title="Dashboard"
          subtitle="Real-time synthetic customer journey telemetry"
          datasets={datasets}
          selectedDatasetId={selectedDatasetId}
          onSelectDataset={handleSelectDataset}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {!hasData ? (
            <EmptyState
              icon={Database}
              title="No Customer Journey Datasets Yet"
              description="Configure your simulation parameters to generate your first realistic synthetic customer dataset with omnichannel touchpoints."
              actionText="Generate First Journey Dataset"
              onAction={() => navigate('/generate')}
            />
          ) : (
            <>
              {/* 6 Core Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <MetricCard
                  label="Total Customers"
                  value={stats.totalCustomers.toLocaleString()}
                  subtext="Synthetic profiles"
                  icon={Users}
                />
                <MetricCard
                  label="Total Sessions"
                  value={stats.totalSessions.toLocaleString()}
                  subtext="Customer visits"
                  icon={Layers}
                />
                <MetricCard
                  label="Total Interactions"
                  value={stats.totalEvents.toLocaleString()}
                  subtext="State events logged"
                  icon={Activity}
                />
                <MetricCard
                  label="Conversion Rate"
                  value={`${activeAnalytics ? activeAnalytics.summary.purchaseConversionRate : stats.overallConversionRate}%`}
                  subtext="Checkout conversion"
                  icon={TrendingUp}
                  trend={{ value: 'Target: >15%', isPositive: true }}
                />
                <MetricCard
                  label="Cart Abandonment"
                  value={`${activeAnalytics ? activeAnalytics.summary.cartAbandonmentRate : stats.overallAbandonmentRate}%`}
                  subtext="Cart drop-off rate"
                  icon={ShoppingCart}
                  trend={{ value: 'Drop benchmark', isPositive: false }}
                />
                <MetricCard
                  label="Generation Runs"
                  value={stats.totalDatasets}
                  subtext="Active datasets"
                  icon={Database}
                />
              </div>

              {/* Row 1: Channel Distribution & Conversion Funnel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Omnichannel Touchpoint Distribution</h3>
                      <p className="text-xs text-slate-500">Interaction volume across web, mobile, email, and ads</p>
                    </div>
                  </div>
                  <ChannelChart data={activeAnalytics?.channelDistribution || []} />
                </div>

                <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Customer Conversion Funnel</h3>
                      <p className="text-xs text-slate-500">From site/app arrival to completed checkout</p>
                    </div>
                  </div>
                  <ConversionChart data={activeAnalytics?.conversionFunnel || []} />
                </div>
              </div>

              {/* Row 2: Journey Drop-off & Purchase vs Abandonment */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Journey Stage Drop-off Analysis</h3>
                      <p className="text-xs text-slate-500">Retained shoppers vs lost sessions across journey steps</p>
                    </div>
                  </div>
                  <DropoffChart data={activeAnalytics?.dropoffAnalysis || []} />
                </div>

                <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900">Session Outcome Breakdown</h3>
                    <p className="text-xs text-slate-500">Purchases, cart abandonments, and browsing only</p>
                  </div>

                  <div className="h-60 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activeAnalytics?.purchaseVsAbandonment || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {(activeAnalytics?.purchaseVsAbandonment || []).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow border border-slate-800">
                                  <p className="font-semibold">{item.name}</p>
                                  <p className="font-mono text-slate-300">Sessions: {item.value}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Active Dataset: <strong className="text-slate-800">{activeAnalytics?.datasetName}</strong></span>
                    <Link to="/ai-insights" className="text-indigo-600 hover:underline flex items-center gap-1 font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Analyze with AI</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Row 3: Customer Activity Trends over Time */}
              {activeAnalytics && activeAnalytics.activityTrends.length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Customer Activity Trends</h3>
                      <p className="text-xs text-slate-500">Interactions and purchase events distributed over the simulation timeframe</p>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activeAnalytics.activityTrends} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow border border-slate-800">
                                  <p className="font-semibold text-slate-100">{item.date}</p>
                                  <p className="text-indigo-300 font-mono">Events: {item.events}</p>
                                  <p className="text-emerald-400 font-mono">Purchases: {item.purchases}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line type="monotone" dataKey="events" name="Total Interactions" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="purchases" name="Purchases" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Row 4: Recent Generation Runs & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Runs */}
                <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900">Recent Generation Runs</h3>
                    <Link to="/datasets" className="text-xs text-indigo-600 hover:underline font-medium">
                      View All
                    </Link>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {stats.recentDatasets.map((d) => (
                      <div key={d.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{d.dataset_name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono tabular-nums">{d.total_customers} customers</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{d.total_events} events</span>
                            <span aria-hidden="true">·</span>
                            <span>{new Date(d.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleSelectDataset(d.id)}
                            className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          >
                            Select
                          </button>
                          <Link
                            to="/explorer"
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Explore events"
                          >
                            <Compass className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Event Stream */}
                <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900">Recent Journey Activity</h3>
                    <Link to="/explorer" className="text-xs text-indigo-600 hover:underline font-medium">
                      Open Explorer
                    </Link>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {stats.recentActivity.map((ev, i) => (
                      <div key={ev.id || i} className="py-2.5 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              ev.event_type === 'PURCHASE'
                                ? 'bg-emerald-500'
                                : ev.event_type === 'CART_ADD'
                                ? 'bg-indigo-500'
                                : 'bg-slate-300'
                            }`}
                          ></span>
                          <span className="font-mono text-slate-700 font-medium shrink-0">{ev.customer_code}</span>
                          <span className="text-slate-600 truncate">
                            {ev.event_type.replace('_', ' ')}
                            {ev.product_name ? ` · ${ev.product_name}` : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-400 font-mono">
                          <span>{ev.channel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            {new Date(ev.event_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
