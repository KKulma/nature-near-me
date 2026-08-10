import React, { useState } from 'react';
import { Search, MapPin, Footprints, Bike, Car, Heart, ChevronRight, Trees, ExternalLink } from 'lucide-react';

export default function SpotSidebar({
  natureSpaces,
  selectedSpot,
  onSelectSpot,
  favorites,
  onToggleFavorite,
  isLoading,
  activeCategory,
  minAreaHectares,
  onMinAreaChange
}) {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredSpaces = natureSpaces.filter((spot) => {
    if (!filterQuery) return true;
    const name = spot.properties.name || '';
    const cat = spot.properties.categoryLabel || '';
    return name.toLowerCase().includes(filterQuery.toLowerCase()) || cat.toLowerCase().includes(filterQuery.toLowerCase());
  });

  const showMinSizeFilter = activeCategory === 'forest' || activeCategory === 'park' || activeCategory === 'reserve';

  return (
    <div className="w-full h-full flex flex-col glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
      
      {/* Sidebar Header & Search */}
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Trees className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Nearby Nature Spots</span>
          </h2>
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
            {filteredSpaces.length} spots
          </span>
        </div>

        {/* Category-Specific Size Filter */}
        {showMinSizeFilter && (
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1 uppercase tracking-wider">
              Min Area:
            </span>
            <div className="flex items-center gap-1">
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
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Local Search Input */}
        <div className="relative">
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none top-3" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter list by name or type..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Spot List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium">Fetching public natural spaces...</p>
          </div>
        ) : filteredSpaces.length > 0 ? (
          filteredSpaces.map((spot) => {
            const isSelected = selectedSpot?.id === spot.id;
            const isFav = favorites.some((f) => f.id === spot.id);
            const iconEmoji = getCategoryEmoji(spot.properties.category);

            return (
              <div
                key={spot.id}
                onClick={() => onSelectSpot(spot)}
                className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20'
                }`}
              >
                {/* Spot Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl p-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 shrink-0">
                      {iconEmoji}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {spot.properties.name}
                      </h3>
                      <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        {spot.properties.categoryLabel}
                      </p>
                    </div>
                  </div>

                  {/* Favorite Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(spot);
                    }}
                    className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 transition-all shrink-0"
                    title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'hover:text-rose-500'}`} />
                  </button>
                </div>

                {/* Distance & Travel Time Chips */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/50 text-[11px]">
                  <div className="flex items-center gap-1 font-extrabold text-slate-700 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{spot.properties.distanceKm} km away</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-0.5" title="Walking time">
                      <Footprints className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      {spot.properties.walkMin}m
                    </span>
                    <span className="flex items-center gap-0.5" title="Cycling time">
                      <Bike className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      {spot.properties.bikeMin}m
                    </span>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="py-12 text-center px-4 space-y-2">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No natural spaces found in this radius.
            </p>
            <p className="text-xs text-slate-400">
              Try increasing the search radius filter above (e.g. 10km or 25km).
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

function getCategoryEmoji(category) {
  switch (category) {
    case 'forest': return '🌲';
    case 'reserve': return '🦅';
    case 'trail': return '🥾';
    case 'water': return '🌊';
    default: return '🏞️';
  }
}
