import React from 'react';
import { Trees, Compass, ShieldAlert, Footprints, Droplets, Layers } from 'lucide-react';

const CATEGORIES = [
  { id: 'forest', label: 'Forests & Woods', icon: Trees },
  { id: 'park', label: 'Parks & Gardens', icon: Trees },
  { id: 'reserve', label: 'Nature Reserves', icon: ShieldAlert },
  { id: 'trail', label: 'Public Footpaths', icon: Footprints },
  { id: 'water', label: 'Lakes & Water', icon: Droplets },
];

const RADII = [
  { value: 1, label: '1 km' },
  { value: 3, label: '3 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
];

export default function FilterBar({
  radius,
  onRadiusChange,
  activeCategory,
  onCategoryChange,
  minAreaHectares,
  onMinAreaChange,
  minPathLengthKm,
  onMinPathLengthChange,
  totalResults,
  isLoading
}) {
  return (
    <div className="w-full glass-panel border-b border-emerald-500/10 px-4 py-2.5 shadow-sm space-y-2">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filters & Results Count */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-1 lg:pt-0 border-t lg:border-t-0 border-slate-200/50 dark:border-slate-800/50">
          
          {/* Results Badge */}
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            {isLoading ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Searching OSM...
              </span>
            ) : (
              <span>
                Found <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{totalResults}</strong> natural spaces
              </span>
            )}
          </div>

          {/* Min Size Pre-Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-1.5 uppercase tracking-wider">
              Min Size:
            </span>
            {[
              { label: 'Any', value: 0 },
              { label: '0.5 ha', value: 0.5 },
              { label: '2 ha', value: 2 },
              { label: '5 ha+', value: 5 }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => onMinAreaChange(opt.value)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                  minAreaHectares === opt.value
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Radius Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-1.5 uppercase tracking-wider">
              Radius:
            </span>
            {RADII.map((r) => (
              <button
                key={r.value}
                onClick={() => onRadiusChange(r.value)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                  radius === r.value
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
