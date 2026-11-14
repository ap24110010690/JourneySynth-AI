// src/pages/AIInsights.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { datasetService } from '../services/datasetService';
import { aiService, AiAnalysisResult } from '../services/aiService';
import { journeyService } from '../services/journeyService';
import { Customer, Dataset } from '../types/frontend';
import {
  Sparkles,
  Send,
  HelpCircle,
  Cpu,
  UserCheck,
  CheckCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

export const AIInsights: React.FC = () => {
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Feature A: Behavioral Report
  const [analysisReport, setAnalysisReport] = useState<AiAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Feature B: Persona Generation
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerForPersona, setSelectedCustomerForPersona] = useState<string>('');
  const [personaResult, setPersonaResult] = useState<any | null>(null);
  const [personaLoading, setPersonaLoading] = useState(false);

  // Feature C: Q&A
  const [question, setQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState<{ question: string; answer: string; source: string }[]>([]);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const allDatasets = await datasetService.getDatasets();
      setDatasets(allDatasets);

      if (allDatasets.length > 0) {
        const id = allDatasets[0].id;
        setSelectedDatasetId(id);
        await loadDatasetContext(id);
      }
    } catch (err) {
      console.error('Failed to load AI Insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDatasetContext = async (datasetId: string) => {
    try {
      const custs = await journeyService.getCustomersByDataset(datasetId);
      setCustomers(custs);
      if (custs.length > 0) {
        setSelectedCustomerForPersona(custs[0].id);
      }
    } catch (err) {
      console.error('Failed to load customers for AI:', err);
    }
  };

  const handleDatasetChange = async (id: string) => {
    setSelectedDatasetId(id);
    setAnalysisReport(null);
    setPersonaResult(null);
    setQaHistory([]);
    await loadDatasetContext(id);
  };

  const handleRunAnalysis = async () => {
    if (!selectedDatasetId) return;
    setAnalyzing(true);
    try {
      const result = await aiService.analyzeDataset(selectedDatasetId);
      setAnalysisReport(result);
    } catch (err: any) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGeneratePersona = async () => {
    if (!selectedCustomerForPersona) return;
    setPersonaLoading(true);
    try {
      const res = await aiService.generatePersona(selectedCustomerForPersona);
      setPersonaResult(res.persona);
    } catch (err) {
      console.error('Persona generation failed:', err);
    } finally {
      setPersonaLoading(false);
    }
  };

  const handleAskQuestion = async (customQ?: string) => {
    const qText = customQ || question;
    if (!qText.trim() || !selectedDatasetId) return;

    setAsking(true);
    try {
      const res = await aiService.askQuestion(selectedDatasetId, qText.trim());
      setQaHistory((prev) => [{ question: qText.trim(), answer: res.answer, source: res.source }, ...prev]);
      if (!customQ) setQuestion('');
    } catch (err) {
      console.error('Q&A failed:', err);
    } finally {
      setAsking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner message="Connecting to Gemini AI Engine..." />
        </div>
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopHeader title="Gemini AI Insights" />
          <div className="p-6">
            <EmptyState
              icon={Sparkles}
              title="No Generated Data for AI Analysis"
              description="Generate a synthetic customer journey dataset first to unlock AI behavioral analysis and persona synthesis."
              actionText="Generate Journeys"
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
          title="Gemini AI Intelligence & Behavioral Analysis"
          subtitle="Grounded retail insights powered by Google Gemini and stored journey data"
          datasets={datasets}
          selectedDatasetId={selectedDatasetId}
          onSelectDataset={handleDatasetChange}
        />

        <main className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
          {/* Feature A: Full Dataset Behavioral Analysis */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Feature A: AI Behavioral & Drop-off Analysis
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Synthesize conversion friction points and optimization strategies grounded in real simulated metrics.
                </p>
              </div>

              <button
                onClick={handleRunAnalysis}
                disabled={analyzing}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors shrink-0"
              >
                {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{analyzing ? 'Analyzing with Gemini...' : 'Analyze with Gemini AI'}</span>
              </button>
            </div>

            {analysisReport ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-100">
                  <span>
                    Analysis Source:{' '}
                    <strong className="text-slate-800">
                      {analysisReport.source === 'gemini' ? 'Google Gemini 3.8 Flash' : 'Statistical Fallback Engine'}
                    </strong>
                  </span>
                  <span>Grounding Metrics: {analysisReport.metricsSummary.conversionRate} Conversion · {analysisReport.metricsSummary.abandonmentRate} Abandonment</span>
                </div>

                <div className="prose prose-sm max-w-none text-xs text-slate-800 bg-slate-50/50 p-6 rounded-xl border border-slate-200/90 whitespace-pre-wrap leading-relaxed">
                  {analysisReport.report}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Click "Analyze with Gemini AI" to generate a complete report for this dataset.</p>
              </div>
            )}
          </section>

          {/* Feature B: AI Customer Persona Generation */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Feature B: Synthetic Customer Persona Synthesis
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Derive qualitative shopper archetypes from individual customer interaction sequences.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={selectedCustomerForPersona}
                  onChange={(e) => setSelectedCustomerForPersona(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none cursor-pointer font-mono"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customer_code} ({c.customer_type})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleGeneratePersona}
                  disabled={personaLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
                >
                  {personaLoading ? 'Synthesizing...' : 'Synthesize Persona'}
                </button>
              </div>
            </div>

            {personaResult ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-600 uppercase">
                      {personaResult.code} · Archetype
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{personaResult.archetype}</h3>
                  </div>
                  <span className="text-xs text-slate-500">{personaResult.demographics}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">Shopping Habits</span>
                    <p className="text-slate-600 leading-relaxed">{personaResult.shoppingStyle}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">Observed Touchpoints</span>
                    <p className="text-slate-600 leading-relaxed">{personaResult.browsingBehavior}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-900 block">Motivation & Conversion Friction</span>
                  <p className="text-slate-600 leading-relaxed">{personaResult.motivationOrFriction}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-900 block">Personalization Engine Suggestions</span>
                  <ul className="space-y-1">
                    {personaResult.recommendations?.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-[11px] text-slate-400 italic text-center pt-2">
                  {personaResult.disclaimer}
                </p>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                Select a customer code from the dropdown above and synthesize their persona.
              </div>
            )}
          </section>

          {/* Feature C: AI Drop-off Q&A */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Feature C: Interactive Drop-off & Conversion Q&A
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ask specific questions about drop-offs, channel effectiveness, or recommender improvements.
              </p>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex flex-wrap gap-2">
              {[
                'Why are customers abandoning carts?',
                'Which channel has the highest conversion?',
                'How can we improve purchase conversion?',
                'What is the drop-off rate between product view and cart addition?',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleAskQuestion(suggestion)}
                  disabled={asking}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-left"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>

            {/* Question Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                placeholder="Ask a question about this journey dataset..."
                disabled={asking}
                className="flex-1 px-4 py-2.5 text-xs rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleAskQuestion()}
                disabled={asking || !question.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors shrink-0"
              >
                {asking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{asking ? 'Thinking...' : 'Ask'}</span>
              </button>
            </div>

            {/* Q&A Conversation History */}
            <div className="space-y-4">
              {qaHistory.map((item, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    <span>{item.question}</span>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed pl-6">
                    {item.answer}
                  </p>
                  <div className="text-[10px] text-slate-400 pl-6">
                    Source: {item.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Statistical Metrics Engine'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
