// src/pages/JourneyExplorer.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { DataTable } from '../components/DataTable';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { journeyService } from '../services/journeyService';
import { datasetService } from '../services/datasetService';
import { aiService } from '../services/aiService';
import {
  CustomerTimelineData,
  Dataset,
  JourneyEvent,
} from '../types/frontend';
import {
  Search,
  SlidersHorizontal,
  Compass,
  X,
  Sparkles,
  Download,
  ArrowLeft,
} from 'lucide-react';

export const JourneyExplorer: React.FC = () => {
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [events, setEvents] = useState<JourneyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActivity, setFilterActivity] = useState('');
  const [filterSegment, setFilterSegment] = useState('');
  const [filterOutcome, setFilterOutcome] = useState('');

  // Selected customer timeline view
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerTimeline, setCustomerTimeline] = useState<CustomerTimelineData | null>(null);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Persona modal state
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [generatedPersona, setGeneratedPersona] = useState<any | null>(null);
  const [personaLoading, setPersonaLoading] = useState(false);

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
        await loadEvents(initialId, 1);
      }
    } catch (err) {
      console.error('Failed to load datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async (datasetId: string, page: number = 1) => {
    if (!datasetId) return;
    try {
      const res = await journeyService.getEvents({
        datasetId,
        search: search.trim() || undefined,
        channel: filterChannel || undefined,
        productCategory: filterCategory || undefined,
        eventType: filterActivity || undefined,
        customerSegment: filterSegment || undefined,
        purchaseStatus: filterOutcome || undefined,
        page,
        limit: 50,
      });

      setEvents(res.events);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const handleDatasetChange = (id: string) => {
    setSelectedDatasetId(id);
    setSelectedCustomerId(null);
    setCustomerTimeline(null);
    loadEvents(id, 1);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents(selectedDatasetId, 1);
  };

  const handleCustomerClick = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    setTimelineLoading(true);
    try {
      const data = await journeyService.getCustomerTimeline(customerId);
      setCustomerTimeline(data);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleGeneratePersona = async () => {
    if (!selectedCustomerId) return;
    setPersonaLoading(true);
    setPersonaModalOpen(true);
    try {
      const result = await aiService.generatePersona(selectedCustomerId);
      setGeneratedPersona(result.persona);
    } catch (err) {
      console.error('Persona generation failed:', err);
    } finally {
      setPersonaLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader
          title="Customer Journey Explorer"
          subtitle="Search, filter, and inspect omnichannel interaction event sequences"
          datasets={datasets}
          selectedDatasetId={selectedDatasetId}
          onSelectDataset={handleDatasetChange}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {loading ? (
            <LoadingSpinner message="Fetching synthetic journey events..." />
          ) : datasets.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No Datasets to Explore"
              description="You haven't generated any customer journey datasets yet. Create your first simulation to begin exploring journeys."
              actionText="Generate Journeys"
              onAction={() => navigate('/generate')}
            />
          ) : (
            <>
              {/* Back button when inspecting an individual customer */}
              {selectedCustomerId && (
                <div className="flex items-center justify-between pb-2">
                  <button
                    onClick={() => {
                      setSelectedCustomerId(null);
                      setCustomerTimeline(null);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Event Table</span>
                  </button>
                  <span className="text-xs text-slate-400">
                    Inspecting Customer Journey
                  </span>
                </div>
              )}

              {/* View 1: Customer Visual Timeline */}
              {selectedCustomerId ? (
                timelineLoading || !customerTimeline ? (
                  <LoadingSpinner message="Assembling chronological customer timeline..." />
                ) : (
                  <JourneyTimeline
                    data={customerTimeline}
                    onGeneratePersona={handleGeneratePersona}
                    isPersonaLoading={personaLoading}
                  />
                )
              ) : (
                /* View 2: Searchable & Filterable Event Table */
                <div className="space-y-4">
                  {/* Filters Bar */}
                  <form
                    onSubmit={handleFilterSubmit}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-3">
                      {/* Search Bar */}
                      <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search customer code, product name, or activity..."
                          className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Dropdown Filters */}
                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <select
                          value={filterChannel}
                          onChange={(e) => setFilterChannel(e.target.value)}
                          className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none cursor-pointer"
                        >
                          <option value="">All Channels</option>
                          <option value="Website">Website</option>
                          <option value="Mobile App">Mobile App</option>
                          <option value="Email">Email</option>
                          <option value="Paid Ads">Paid Ads</option>
                        </select>

                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none cursor-pointer"
                        >
                          <option value="">All Categories</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Fashion">Fashion</option>
                          <option value="Groceries">Groceries</option>
                          <option value="Beauty">Beauty</option>
                          <option value="Home Appliances">Home Appliances</option>
                          <option value="Sports">Sports</option>
                          <option value="Books">Books</option>
                        </select>

                        <select
                          value={filterActivity}
                          onChange={(e) => setFilterActivity(e.target.value)}
                          className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none cursor-pointer"
                        >
                          <option value="">All Activities</option>
                          <option value="AD_IMPRESSION">Ad Impression</option>
                          <option value="AD_CLICK">Ad Click</option>
                          <option value="WEBSITE_VISIT">Website Visit</option>
                          <option value="APP_VISIT">App Visit</option>
                          <option value="PRODUCT_VIEW">Product View</option>
                          <option value="EMAIL_RECEIVED">Email Received</option>
                          <option value="EMAIL_CLICK">Email Click</option>
                          <option value="CART_ADD">Cart Addition</option>
                          <option value="CART_REMOVE">Cart Removal</option>
                          <option value="PURCHASE">Purchase Completed</option>
                          <option value="CHURN">Drop-off / Churn</option>
                        </select>

                        <select
                          value={filterOutcome}
                          onChange={(e) => setFilterOutcome(e.target.value)}
                          className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none cursor-pointer"
                        >
                          <option value="">All Outcomes</option>
                          <option value="CONVERTED">Converted</option>
                          <option value="ABANDONED">Cart Abandoned</option>
                          <option value="BROWSED">Browsed Only</option>
                        </select>

                        <button
                          type="submit"
                          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* High-density Data Table */}
                  <DataTable
                    events={events}
                    pagination={pagination}
                    onPageChange={(page) => loadEvents(selectedDatasetId, page)}
                    onSelectCustomer={handleCustomerClick}
                  />
                </div>
              )}
            </>
          )}

          {/* AI Persona Generation Modal */}
          {personaModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      AI Customer Persona Synthesis
                    </h3>
                  </div>
                  <button
                    onClick={() => setPersonaModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {personaLoading || !generatedPersona ? (
                  <LoadingSpinner
                    message="Synthesizing behavioral psychological persona..."
                    subtext="Grounding characteristics in the customer's real synthetic event stream..."
                  />
                ) : (
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Persona Archetype
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {generatedPersona.code}
                        </span>
                      </div>
                      <h4 className="text-lg font-extrabold text-slate-900">
                        {generatedPersona.archetype}
                      </h4>
                      <p className="text-xs text-slate-600">{generatedPersona.demographics}</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Shopping Preferences & Behavior
                      </h5>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {generatedPersona.shoppingStyle}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Observed Journey Dynamics
                      </h5>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {generatedPersona.browsingBehavior}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Purchase Motivation or Drop-off Friction
                      </h5>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {generatedPersona.motivationOrFriction}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Model Personalization Recommendations
                      </h5>
                      <ul className="space-y-1.5">
                        {generatedPersona.recommendations?.map((rec: string, i: number) => (
                          <li
                            key={i}
                            className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic text-center">
                      {generatedPersona.disclaimer || 'Synthetic AI-Generated Interpretation for Model Testing'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
