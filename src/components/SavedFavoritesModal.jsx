import React from 'react';
import { X, Heart, MapPin, Footprints, Trash2, ExternalLink } from 'lucide-react';

export default function SavedFavoritesModal({
  isOpen,
  onClose,
  favorites,
  onSelectSpot,
  onRemoveFavorite,
  onClearAll
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-500">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">Saved Nature Spots</h2>
              <p className="text-xs text-slate-500">{favorites.length} saved spaces</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Favorites List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {favorites.length > 0 ? (
            favorites.map((spot) => (
              <div
                key={spot.id}
                onClick={() => {
                  onSelectSpot(spot);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 cursor-pointer flex items-center justify-between gap-3 transition-all"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">
                    {spot.properties.name}
                  </h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {spot.properties.categoryLabel}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(spot.id);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center space-y-2">
              <Heart className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No saved nature spots yet.
              </p>
              <p className="text-xs text-slate-400">
                Click the heart icon on any park, forest, or footpath to bookmark it here.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {favorites.length > 0 && (
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
            <button
              onClick={onClearAll}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              Clear All Saved
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
