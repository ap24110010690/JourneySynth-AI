// src/components/DataTable.tsx
import React from 'react';
import { JourneyEvent } from '../types/frontend';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps {
  events: JourneyEvent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
  onSelectCustomer?: (customerId: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  events,
  pagination,
  onPageChange,
  onSelectCustomer,
}) => {
  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return ts;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Event ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Session</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Channel</th>
              <th className="py-3 px-4">Activity</th>
              <th className="py-3 px-4">Product Details</th>
              <th className="py-3 px-4">Session Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No matching journey events found.
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px] tabular-nums">
                    {e.id.substring(0, 8)}...
                  </td>
                  <td className="py-2.5 px-4">
                    <button
                      onClick={() => onSelectCustomer && onSelectCustomer(e.customer_id)}
                      className="text-indigo-600 hover:text-indigo-800 font-mono font-medium hover:underline text-left"
                    >
                      {e.customer_code}
                    </button>
                    <span className="block text-[11px] text-slate-400 truncate max-w-[120px]">{e.customer_name}</span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 text-[11px]">{e.session_code}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 text-[11px] tabular-nums whitespace-nowrap">
                    {formatTimestamp(e.event_timestamp)}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="inline-flex items-center text-slate-700 font-medium">
                      {e.channel}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        e.event_type === 'PURCHASE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : e.event_type === 'CART_ADD'
                          ? 'bg-indigo-50 text-indigo-700'
                          : e.event_type === 'CHURN'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {e.event_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 max-w-[200px]">
                    {e.product_name ? (
                      <div>
                        <span className="font-medium text-slate-900 truncate block">{e.product_name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {e.product_category} · ${e.product_price?.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`text-[11px] font-medium ${
                        e.conversion_status === 'CONVERTED'
                          ? 'text-emerald-600'
                          : e.conversion_status === 'ABANDONED'
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {e.conversion_status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="py-3 px-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-mono tabular-nums font-semibold text-slate-700">{events.length}</span> of{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-700">{pagination.total}</span> events
        </div>

        <div className="flex items-center gap-2">
          <span>
            Page <span className="font-mono tabular-nums font-medium">{pagination.page}</span> of{' '}
            <span className="font-mono tabular-nums font-medium">{pagination.totalPages || 1}</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
