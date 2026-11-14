// src/components/JourneyTimeline.tsx
import React from 'react';
import { CustomerTimelineData, JourneyEvent } from '../types/frontend';
import {
  Globe,
  Smartphone,
  Mail,
  Megaphone,
  Eye,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  LogOut,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface JourneyTimelineProps {
  data: CustomerTimelineData;
  onGeneratePersona?: () => void;
  isPersonaLoading?: boolean;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  data,
  onGeneratePersona,
  isPersonaLoading,
}) => {
  const { customer, metrics, timeline } = data;

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Website':
        return <Globe className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Mobile App':
        return <Smartphone className="w-3.5 h-3.5 text-sky-600" />;
      case 'Email':
        return <Mail className="w-3.5 h-3.5 text-teal-600" />;
      case 'Paid Ads':
        return <Megaphone className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'PRODUCT_VIEW':
        return <Eye className="w-3.5 h-3.5 text-indigo-600" />;
      case 'CART_ADD':
        return <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />;
      case 'CART_REMOVE':
        return <Trash2 className="w-3.5 h-3.5 text-rose-500" />;
      case 'PURCHASE':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'CHURN':
        return <LogOut className="w-3.5 h-3.5 text-slate-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return ts;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Customer Header & Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 font-mono">{customer.customer_code}</h2>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
              {customer.customer_type}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                metrics.purchaseStatus === 'COMPLETED'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 bg-slate-100'
              }`}
            >
              {metrics.purchaseStatus === 'COMPLETED' ? 'Purchase Converted' : 'Non-Converted'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5">
            <span>{customer.customer_name}</span>
            <span aria-hidden="true">·</span>
            <span>{customer.location}</span>
            <span aria-hidden="true">·</span>
            <span>{customer.device_preference}</span>
          </div>
        </div>

        {onGeneratePersona && (
          <button
            onClick={onGeneratePersona}
            disabled={isPersonaLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors whitespace-nowrap self-start md:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPersonaLoading ? 'Synthesizing Persona...' : 'Generate AI Persona'}</span>
          </button>
        )}
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Total Interactions</span>
          <span className="text-base font-bold text-slate-900 font-mono tabular-nums">{metrics.totalInteractions}</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Sessions</span>
          <span className="text-base font-bold text-slate-900 font-mono tabular-nums">{metrics.totalSessions}</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Channels Used</span>
          <span className="text-base font-bold text-slate-900 font-mono tabular-nums">{metrics.channelsUsed.length}</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Products Viewed</span>
          <span className="text-base font-bold text-slate-900 font-mono tabular-nums">{metrics.productsViewed.length}</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Cart Additions</span>
          <span className="text-base font-bold text-slate-900 font-mono tabular-nums">{metrics.cartAdditions}</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Journey Duration</span>
          <span className="text-base font-bold text-slate-900 font-mono tabular-nums">{metrics.journeyDurationDays} Day{metrics.journeyDurationDays > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Visual Timeline Grouped by Day */}
      <div className="space-y-6 pt-2">
        {timeline.map((dayGroup) => (
          <div key={dayGroup.date} className="space-y-3">
            {/* Day Header */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-md text-xs font-semibold text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Day {dayGroup.dayIndex}</span>
                <span className="text-slate-400 font-normal">({dayGroup.date})</span>
              </div>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Events in this Day */}
            <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {dayGroup.events.map((ev: JourneyEvent, evIdx: number) => {
                const metadata = ev.event_metadata ? JSON.parse(ev.event_metadata) : {};
                const isPurchase = ev.event_type === 'PURCHASE';
                const isCartAdd = ev.event_type === 'CART_ADD';

                return (
                  <div
                    key={ev.id || evIdx}
                    className={`relative p-3.5 rounded-lg border transition-all ${
                      isPurchase
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : isCartAdd
                        ? 'bg-indigo-50/40 border-indigo-200'
                        : 'bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-6 top-4 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        isPurchase
                          ? 'border-emerald-600'
                          : isCartAdd
                          ? 'border-indigo-600'
                          : 'border-slate-400'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPurchase ? 'bg-emerald-600' : isCartAdd ? 'bg-indigo-600' : 'bg-slate-400'
                        }`}
                      ></div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-slate-100 text-slate-600">{getChannelIcon(ev.channel)}</span>
                        <span className="text-xs font-bold text-slate-800">{ev.event_type.replace('_', ' ')}</span>
                        <span className="text-[11px] text-slate-500 font-mono">[{ev.channel}]</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {formatTimestamp(ev.event_timestamp)}
                      </span>
                    </div>

                    {/* Product or Metadata details */}
                    {(ev.product_name || metadata.cartValue !== undefined) && (
                      <div className="mt-2 text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {ev.product_name && (
                          <div className="flex items-center gap-1.5 font-medium text-slate-900">
                            {getEventIcon(ev.event_type)}
                            <span>{ev.product_name}</span>
                            {ev.product_price && (
                              <span className="text-slate-500 font-mono">(${ev.product_price.toFixed(2)})</span>
                            )}
                          </div>
                        )}
                        {ev.product_category && (
                          <span className="text-slate-500">Category: {ev.product_category}</span>
                        )}
                        {metadata.cartValue !== undefined && metadata.cartValue > 0 && (
                          <span className="text-indigo-600 font-medium font-mono">
                            Cart Value: ${metadata.cartValue.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
