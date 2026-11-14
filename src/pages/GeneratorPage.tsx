// src/pages/GeneratorPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { datasetService } from '../services/datasetService';
import {
  CustomerSegment,
  ProductCategory,
  TouchpointChannel,
} from '../types/frontend';
import {
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  Globe,
  Smartphone,
  Mail,
  Megaphone,
  Check,
  AlertCircle,
  Loader2,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const GeneratorPage: React.FC = () => {
  const navigate = useNavigate();

  // Generator State
  const [datasetName, setDatasetName] = useState('Omnichannel Holiday Retail Cohort');
  const [customerCount, setCustomerCount] = useState<number>(100);
  const [customCustomerCount, setCustomCustomerCount] = useState<string>('');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [seed, setSeed] = useState<string>('42');

  const [selectedChannels, setSelectedChannels] = useState<TouchpointChannel[]>([
    'Website',
    'Mobile App',
    'Email',
    'Paid Ads',
  ]);

  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([
    'Electronics',
    'Fashion',
    'Groceries',
    'Beauty',
    'Home Appliances',
    'Sports',
    'Books',
  ]);

  const [selectedSegments, setSelectedSegments] = useState<CustomerSegment[]>([
    'New Customers',
    'Returning Customers',
    'High-Intent Customers',
    'Browsing Customers',
    'Discount-Seeking Customers',
    'Cart-Abandoning Customers',
  ]);

  // Probabilities (0 to 1)
  const [cartAbandonmentProb, setCartAbandonmentProb] = useState<number>(0.35);
  const [purchaseProb, setPurchaseProb] = useState<number>(0.28);
  const [emailEngagementProb, setEmailEngagementProb] = useState<number>(0.25);
  const [adClickProb, setAdClickProb] = useState<number>(0.2);
  const [productRevisitProb, setProductRevisitProb] = useState<number>(0.35);
  const [returningCustomerProb, setReturningCustomerProb] = useState<number>(0.3);

  // Time gaps (minutes)
  const [minTimeGap, setMinTimeGap] = useState<number>(5);
  const [maxTimeGap, setMaxTimeGap] = useState<number>(120);

  // Status & Results
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [completedResult, setCompletedResult] = useState<any | null>(null);

  const allChannels: { id: TouchpointChannel; label: string; icon: any }[] = [
    { id: 'Website', label: 'Website Storefront', icon: Globe },
    { id: 'Mobile App', label: 'Mobile Application', icon: Smartphone },
    { id: 'Email', label: 'Email Marketing', icon: Mail },
    { id: 'Paid Ads', label: 'Paid Advertisements', icon: Megaphone },
  ];

  const allCategories: ProductCategory[] = [
    'Electronics',
    'Fashion',
    'Groceries',
    'Beauty',
    'Home Appliances',
    'Sports',
    'Books',
  ];

  const allSegments: CustomerSegment[] = [
    'New Customers',
    'Returning Customers',
    'High-Intent Customers',
    'Browsing Customers',
    'Discount-Seeking Customers',
    'Cart-Abandoning Customers',
  ];

  const toggleChannel = (channel: TouchpointChannel) => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== channel));
      }
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const toggleCategory = (cat: ProductCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const toggleSegment = (seg: CustomerSegment) => {
    if (selectedSegments.includes(seg)) {
      if (selectedSegments.length > 1) {
        setSelectedSegments(selectedSegments.filter((s) => s !== seg));
      }
    } else {
      setSelectedSegments([...selectedSegments, seg]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCompletedResult(null);

    const totalCustomers = customCustomerCount ? parseInt(customCustomerCount, 10) : customerCount;
    if (isNaN(totalCustomers) || totalCustomers < 1 || totalCustomers > 2000) {
      setError('Please provide a valid customer count between 1 and 2,000');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress('Initializing Markov Chain transition engine...');

    try {
      setTimeout(() => {
        setGenerationProgress('Simulating multi-session state transitions across touchpoints...');
      }, 400);

      const parsedSeed = seed.trim() ? parseInt(seed.trim(), 10) : undefined;

      const res = await datasetService.generateDataset({
        datasetName,
        totalCustomers,
        channels: selectedChannels,
        categories: selectedCategories,
        segments: selectedSegments,
        durationDays,
        cartAbandonmentProb,
        purchaseProb,
        emailEngagementProb,
        adClickProb,
        productRevisitProb,
        returningCustomerProb,
        minTimeGapMinutes: minTimeGap,
        maxTimeGapMinutes: maxTimeGap,
        seed: isNaN(parsedSeed as number) ? undefined : parsedSeed,
      });

      setGenerationProgress('Committing customer sessions and events to relational database...');
      setCompletedResult(res);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader
          title="Synthetic Journey Generator"
          subtitle="Configure probabilistic customer behaviour simulation"
        />

        <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {completedResult && (
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>Simulation Complete: {completedResult.dataset.dataset_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/explorer')}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>Inspect Journeys</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigate('/analytics')}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    View Analytics
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center">
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-[11px] text-slate-500 block">Customers</span>
                  <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                    {completedResult.stats.totalCustomers}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-[11px] text-slate-500 block">Sessions</span>
                  <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                    {completedResult.stats.totalSessions}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-[11px] text-slate-500 block">Total Events</span>
                  <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                    {completedResult.stats.totalEvents.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-[11px] text-slate-500 block">Conversion Rate</span>
                  <span className="text-base font-bold text-emerald-600 font-mono tabular-nums">
                    {completedResult.stats.conversionRate}%
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-[11px] text-slate-500 block">Abandonment</span>
                  <span className="text-base font-bold text-amber-600 font-mono tabular-nums">
                    {completedResult.stats.abandonmentRate}%
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Section A: Dataset Identification & Size */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">A. Dataset Identity & Scale</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dataset Name
                  </label>
                  <input
                    type="text"
                    required
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    placeholder="e.g., Q4 Black Friday Recommender Benchmark"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Journey Simulation Duration
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 3, 7, 15, 30].map((days) => (
                      <button
                        type="button"
                        key={days}
                        onClick={() => setDurationDays(days)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                          durationDays === days
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {days}D
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Number of Customer Profiles */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Number of Customer Profiles
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[10, 50, 100, 500, 1000].map((cnt) => (
                    <button
                      type="button"
                      key={cnt}
                      onClick={() => {
                        setCustomerCount(cnt);
                        setCustomCustomerCount('');
                      }}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors font-mono tabular-nums ${
                        customerCount === cnt && !customCustomerCount
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Custom"
                      min={1}
                      max={2000}
                      value={customCustomerCount}
                      onChange={(e) => {
                        setCustomCustomerCount(e.target.value);
                      }}
                      className={`w-full py-2 px-3 text-xs font-semibold rounded-lg border text-center font-mono ${
                        customCustomerCount
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-700'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section B: Omnichannel Touchpoints */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Globe className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">B. Omnichannel Touchpoints</h3>
                <span className="text-xs text-slate-400">({selectedChannels.length} active)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {allChannels.map((c) => {
                  const Icon = c.icon;
                  const isChecked = selectedChannels.includes(c.id);
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => toggleChannel(c.id)}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        isChecked
                          ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-500'
                          : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block">{c.label}</span>
                        <span className="text-[11px] text-slate-500">
                          {isChecked ? 'Simulated' : 'Excluded'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section C: Product Categories & Customer Segments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Categories */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">C. Retail Product Categories</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Segments */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">D. Target Customer Segments</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {allSegments.map((seg) => {
                    const isChecked = selectedSegments.includes(seg);
                    return (
                      <button
                        type="button"
                        key={seg}
                        onClick={() => toggleSegment(seg)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          isChecked
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {seg}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section D: Customer Behaviour Parameters (Markov Transition Probabilities) */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    E. Customer Behaviour Parameters & Probabilities
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">Governs Markov Transition Weights</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-semibold text-slate-700">Cart Abandonment Rate</span>
                    <span className="font-mono tabular-nums text-amber-600 font-bold">
                      {Math.round(cartAbandonmentProb * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={cartAbandonmentProb}
                    onChange={(e) => setCartAbandonmentProb(parseFloat(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                  <span className="text-[11px] text-slate-400 block mt-0.5">Probability of dropping after cart addition</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-semibold text-slate-700">Purchase Probability</span>
                    <span className="font-mono tabular-nums text-emerald-600 font-bold">
                      {Math.round(purchaseProb * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={purchaseProb}
                    onChange={(e) => setPurchaseProb(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <span className="text-[11px] text-slate-400 block mt-0.5">Base probability of completing checkout</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-semibold text-slate-700">Product Revisit Rate</span>
                    <span className="font-mono tabular-nums text-indigo-600 font-bold">
                      {Math.round(productRevisitProb * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={productRevisitProb}
                    onChange={(e) => setProductRevisitProb(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <span className="text-[11px] text-slate-400 block mt-0.5">Looping product views before decision</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-semibold text-slate-700">Email Engagement</span>
                    <span className="font-mono tabular-nums text-teal-600 font-bold">
                      {Math.round(emailEngagementProb * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={emailEngagementProb}
                    onChange={(e) => setEmailEngagementProb(parseFloat(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                  <span className="text-[11px] text-slate-400 block mt-0.5">Click-through probability on emails</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-semibold text-slate-700">Advertisement Click</span>
                    <span className="font-mono tabular-nums text-sky-600 font-bold">
                      {Math.round(adClickProb * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={adClickProb}
                    onChange={(e) => setAdClickProb(parseFloat(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                  <span className="text-[11px] text-slate-400 block mt-0.5">Ad impression to storefront visit rate</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-semibold text-slate-700">Multi-Session Loyalty</span>
                    <span className="font-mono tabular-nums text-purple-600 font-bold">
                      {Math.round(returningCustomerProb * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={returningCustomerProb}
                    onChange={(e) => setReturningCustomerProb(parseFloat(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                  <span className="text-[11px] text-slate-400 block mt-0.5">Chance of generating 2-4 sessions</span>
                </div>
              </div>
            </div>

            {/* Section E: Time Gaps & Seed */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">F. Timing Dynamics & Reproducibility</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Min Time Gap (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={360}
                    value={minTimeGap}
                    onChange={(e) => setMinTimeGap(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Max Time Gap (Minutes)
                  </label>
                  <input
                    type="number"
                    min={minTimeGap}
                    max={1440}
                    value={maxTimeGap}
                    onChange={(e) => setMaxTimeGap(parseInt(e.target.value, 10) || 60)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Random Seed (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 42"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Submission Section */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500">
                <span>Simulation model: <strong className="text-slate-800">Stateful Markov Chain Engine</strong></span>
                <span className="mx-2">·</span>
                <span>Target: <strong className="text-slate-800">{customCustomerCount || customerCount} Customer Profiles</strong></span>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{generationProgress || 'Synthesizing...'}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Generate Customer Journeys</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
