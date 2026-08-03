import React, { useState, useEffect, useRef } from 'react';
import { Trees, Search, MapPin, Navigation, Heart, Sun, Moon, Compass, X } from 'lucide-react';
import { searchLocations } from '../services/nominatimService';

export default function Header({
  userLocation,
  onSelectLocation,
  onLocateMe,
  isLocating,
  favoritesCount,
  onOpenFavorites,
  isDarkMode,
  onToggleDarkMode
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search input
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setShowDropdown(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (item) => {
    onSelectLocation({ lat: item.lat, lng: item.lng, name: item.shortName });
    setSearchQuery(item.shortName);
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel shadow-sm border-b border-emerald-500/20 px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Trees className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                Nature Near Me
              </h1>
              <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 opacity-90">
                Discover Free Public Nature
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenFavorites}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition-colors"
              title="Saved Favorites"
            >
              <Heart className="w-5 h-5 fill-rose-500/20 text-rose-500" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Search Bar & Geolocation Button */}
        <div className="relative w-full md:max-w-md" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search town, city, or postcode..."
              className="w-full pl-10 pr-24 py-2.5 text-sm rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-inner transition-all"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-20 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onLocateMe}
              disabled={isLocating}
              className="absolute right-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
              title="Find my current location"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  Searching OpenStreetMap...
                </div>
              ) : searchResults.length > 0 ? (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-60 overflow-y-auto">
                  {searchResults.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleSelect(item)}
                        className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-start gap-2.5 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                            {item.shortName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {item.displayName}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  No location results found. Try a different city or postcode.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenFavorites}
            className="relative px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all shadow-sm"
          >
            <Heart className="w-4 h-4 fill-rose-500/20 text-rose-500" />
            <span>Saved Spots</span>
            {favoritesCount > 0 && (
              <span className="px-1.5 py-0.5 bg-emerald-500 text-white font-bold text-[10px] rounded-full">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 transition-all shadow-sm"
            title="Toggle theme mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

      </div>
    </header>
  );
}
