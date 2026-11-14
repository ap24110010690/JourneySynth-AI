// src/pages/DatasetManagement.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { datasetService } from '../services/datasetService';
import { Dataset } from '../types/frontend';
import {
  Database,
  Download,
  Trash2,
  Compass,
  BarChart2,
  Plus,
  FileSpreadsheet,
  FileJson,
  Calendar,
  Users,
  Activity,
  Layers,
} from 'lucide-react';

export const DatasetManagement: React.FC = () => {
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    setLoading(true);
    try {
      const data = await datasetService.getDatasets();
      setDatasets(data);
    } catch (err) {
      console.error('Failed to load datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete dataset "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await datasetService.deleteDataset(id);
      setDatasets((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Failed to delete dataset:', err);
      alert('Failed to delete dataset');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadCsv = (datasetId: string) => {
    window.location.href = datasetService.getExportCsvUrl(datasetId);
  };

  const handleDownloadJson = (datasetId: string) => {
    window.location.href = datasetService.getExportJsonUrl(datasetId);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner message="Loading your generated datasets..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader
          title="Dataset Management & Export"
          subtitle="Manage, inspect, and export your synthetic omnichannel journey datasets"
          actions={
            <button
              onClick={() => navigate('/generate')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Dataset</span>
            </button>
          }
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {datasets.length === 0 ? (
            <EmptyState
              icon={Database}
              title="No Datasets Stored"
              description="You have not created any customer journey datasets yet. Generate a simulation to test personalization and recommender models."
              actionText="Generate Journey Dataset"
              onAction={() => navigate('/generate')}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Stored Synthetic Datasets</h3>
                  <p className="text-xs text-slate-500">
                    Total {datasets.length} dataset{datasets.length > 1 ? 's' : ''} available for inspection and export
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                      <th className="py-3 px-5">Dataset Name</th>
                      <th className="py-3 px-5">Dataset ID</th>
                      <th className="py-3 px-5">Customers</th>
                      <th className="py-3 px-5">Sessions</th>
                      <th className="py-3 px-5">Events</th>
                      <th className="py-3 px-5">Created At</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {datasets.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-900">
                          {d.dataset_name}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-400 text-[11px]">
                          {d.id.substring(0, 13)}...
                        </td>
                        <td className="py-3.5 px-5 font-mono tabular-nums text-slate-700">
                          {d.total_customers.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5 font-mono tabular-nums text-slate-700">
                          {d.total_sessions.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5 font-mono tabular-nums text-slate-700 font-medium">
                          {d.total_events.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                          {new Date(d.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Explore Journeys */}
                            <button
                              onClick={() => navigate('/explorer')}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Explore Events"
                            >
                              <Compass className="w-4 h-4" />
                            </button>

                            {/* View Analytics */}
                            <button
                              onClick={() => navigate('/analytics')}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="View Analytics"
                            >
                              <BarChart2 className="w-4 h-4" />
                            </button>

                            {/* Export CSV */}
                            <button
                              onClick={() => handleDownloadCsv(d.id)}
                              className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Download CSV"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                            </button>

                            {/* Export JSON */}
                            <button
                              onClick={() => handleDownloadJson(d.id)}
                              className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Download JSON"
                            >
                              <FileJson className="w-4 h-4" />
                            </button>

                            {/* Delete Dataset */}
                            <button
                              onClick={() => handleDelete(d.id, d.dataset_name)}
                              disabled={deletingId === d.id}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-40"
                              title="Delete Dataset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
