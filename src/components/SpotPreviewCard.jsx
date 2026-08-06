import React from 'react';
import { MapPin, Footprints, Bike, ChevronRight, X, Heart, Navigation, ExternalLink } from 'lucide-react';

export default function SpotPreviewCard({
  spot,
  onClose,
  onExpandDetail,
  isFavorite,
  onToggleFavorite,
  userLocation
}) {
  if (!spot) return null;

  const { name, categoryLabel, distanceKm, walkMin, bikeMin, centroid } = spot.properties;
  const coords = centroid || (
    spot.geometry.type === 'Point' 
      ? spot.geometry.coordinates 
      : spot.geometry.coordinates[0]
  );

  const lng = coords ? coords[0] : userLocation.lng;
  const lat = coords ? coords[1] : userLocation.lat;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=walking`;

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-30 animate-in slide-in-from-bottom-4 duration-250">
      <div 
        onClick={onExpandDetail}
        className="glass-panel p-4 rounded-3xl shadow-2xl border border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer group transition-all"
      >
        {/* Top bar with close button & favorite */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
              {categoryLabel}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              📍 {distanceKm} km away
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(spot);
              }}
              className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 transition-colors"
              title={isFavorite ? 'Remove favorite' : 'Save favorite'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'hover:text-rose-500'}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
          {name}
        </h3>

        {/* Travel Time Chips & Physical Size Badge */}
        <div className="flex flex-wrap items-center gap-2 my-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <span className="flex items-center gap-1 bg-white/60 dark:bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
            <Footprints className="w-3.5 h-3.5 text-emerald-500" />
            ~{walkMin}m walk
          </span>
          <span className="flex items-center gap-1 bg-white/60 dark:bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
            <Bike className="w-3.5 h-3.5 text-emerald-500" />
            ~{bikeMin}m cycle
          </span>
          {spot.properties.areaHectares > 0 && (
            <span className="flex items-center gap-1 bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-1 rounded-xl text-emerald-800 dark:text-emerald-300 font-bold">
              📐 {spot.properties.areaHectares} ha
            </span>
          )}
          {spot.properties.lengthKm > 0 && (
            <span className="flex items-center gap-1 bg-amber-100/80 dark:bg-amber-950/80 px-2.5 py-1 rounded-xl text-amber-800 dark:text-amber-300 font-bold">
              🥾 {spot.properties.lengthKm} km
            </span>
          )}
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/50 text-xs">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Navigation className="w-3.5 h-3.5" /> Directions
          </a>

          <div className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
            <span>More Info & GPX</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

      </div>
    </div>
  );
}
