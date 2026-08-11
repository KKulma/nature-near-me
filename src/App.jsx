import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import MapLibreView from './components/MapLibreView';
import SpotSidebar from './components/SpotSidebar';
import SpotPreviewCard from './components/SpotPreviewCard';
import SpotDetailModal from './components/SpotDetailModal';
import SavedFavoritesModal from './components/SavedFavoritesModal';
import { fetchNatureSpaces } from './services/overpassService';
import { Map, List, Compass } from 'lucide-react';

// Default initial location: London UK coordinates
const DEFAULT_LOCATION = {
  lat: 51.5074,
  lng: -0.1278,
  name: 'London, UK'
};

export default function App() {
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [radiusKm, setRadiusKm] = useState(5);
  const [activeCategory, setActiveCategory] = useState('forest'); // Default to Forests & Woods
  const [minAreaHectares, setMinAreaHectares] = useState(0); // Default min 0 (Any)
  const [minPathLengthKm, setMinPathLengthKm] = useState(0.2);
  const [natureSpaces, setNatureSpaces] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null); // Spot highlighted on map with floating preview card
  const [expandedSpot, setExpandedSpot] = useState(null); // Spot opened in full detail modal
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('map'); // 'map' or 'list'

  // Saved Favorites stored in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('nature_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Dark Mode toggle
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync dark mode class to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nature_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  }, [favorites]);

  // Attempt browser geolocation on initial mount
  useEffect(() => {
    handleLocateMe();
  }, []);

  // When a spot is clicked from sidebar list: pan map to center on its round tree icon pin
  const handleSelectSpotFromList = (spot) => {
    setSelectedSpot(spot);
    setActiveMobileTab('map');
  };

  // When a round tree icon pin is clicked on the map screen: center map AND open summary screen modal
  const handlePinClick = (spot) => {
    setSelectedSpot(spot);
    setExpandedSpot(spot);
  };

  // Reset selection and fetch nature spaces whenever userLocation, radiusKm, activeCategory, or minAreaHectares changes
  useEffect(() => {
    let isSubscribed = true;

    // Reset selected spot so the map strictly stays on user location
    setSelectedSpot(null);
    setExpandedSpot(null);

    async function loadSpaces() {
      setIsLoading(true);
      try {
        const spaces = await fetchNatureSpaces(
          userLocation.lat,
          userLocation.lng,
          radiusKm,
          activeCategory,
          minAreaHectares,
          minPathLengthKm
        );
        if (isSubscribed) {
          setNatureSpaces(spaces);
        }
      } catch (err) {
        console.error('Failed to load natural spaces:', err);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    loadSpaces();

    return () => {
      isSubscribed = false;
    };
  }, [userLocation, radiusKm, activeCategory, minAreaHectares, minPathLengthKm]);

  // Handle Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedSpot(null);
        setExpandedSpot(null);
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'Your Location'
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Toggle Favorite Spot
  const handleToggleFavorite = (spot) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === spot.id);
      if (exists) {
        return prev.filter((f) => f.id !== spot.id);
      } else {
        return [...prev, spot];
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-900 transition-colors">
      
      {/* Navbar Header */}
      <Header
        userLocation={userLocation}
        onSelectLocation={(loc) => setUserLocation(loc)}
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Filter Bar (Radius + Category Pills) */}
      <FilterBar
        radius={radiusKm}
        onRadiusChange={(r) => setRadiusKm(r)}
        activeCategory={activeCategory}
        onCategoryChange={(c) => setActiveCategory(c)}
        totalResults={natureSpaces.length}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        
        {/* Mobile Tab Switcher */}
        <div className="lg:hidden col-span-1 flex items-center justify-center p-1 bg-slate-200/70 dark:bg-slate-900/70 rounded-2xl border border-slate-300/50 dark:border-slate-800">
          <button
            onClick={() => setActiveMobileTab('map')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeMobileTab === 'map'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Map className="w-4 h-4" /> Map View
          </button>
          <button
            onClick={() => setActiveMobileTab('list')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeMobileTab === 'list'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <List className="w-4 h-4" /> List ({natureSpaces.length})
          </button>
        </div>

        {/* Map View Container (Takes 2 columns on desktop) */}
        <div className={`relative col-span-1 lg:col-span-2 h-[550px] lg:h-[640px] ${activeMobileTab === 'list' ? 'hidden lg:block' : 'block'}`}>
          <MapLibreView
            userLocation={userLocation}
            radiusKm={radiusKm}
            activeCategory={activeCategory}
            natureSpaces={natureSpaces}
            selectedSpot={selectedSpot}
            onSelectSpot={handlePinClick}
            isDarkMode={isDarkMode}
            isLoading={isLoading}
            onLocateMe={handleLocateMe}
            isLocating={isLocating}
          />

          {/* Floating Preview Card */}
          {selectedSpot && (
            <SpotPreviewCard
              spot={selectedSpot}
              onClose={() => setSelectedSpot(null)}
              onExpandDetail={() => setExpandedSpot(selectedSpot)}
              isFavorite={favorites.some((f) => f.id === selectedSpot.id)}
              onToggleFavorite={handleToggleFavorite}
              userLocation={userLocation}
            />
          )}
        </div>

        {/* Spot Sidebar Container (Takes 1 column on desktop) */}
        <div className={`col-span-1 h-[550px] lg:h-[640px] ${activeMobileTab === 'map' ? 'hidden lg:block' : 'block'}`}>
          <SpotSidebar
            natureSpaces={natureSpaces}
            selectedSpot={selectedSpot}
            onSelectSpot={handleSelectSpotFromList}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            isLoading={isLoading}
            activeCategory={activeCategory}
            minAreaHectares={minAreaHectares}
            onMinAreaChange={(a) => setMinAreaHectares(a)}
          />
        </div>

      </main>

      {/* Summary Screen Modal (Pops up when round tree icon pin on map is clicked) */}
      {expandedSpot && (
        <SpotDetailModal
          spot={expandedSpot}
          onClose={() => setExpandedSpot(null)}
          isFavorite={favorites.some((f) => f.id === expandedSpot.id)}
          onToggleFavorite={handleToggleFavorite}
          userLocation={userLocation}
        />
      )}

      {/* Saved Favorites Drawer */}
      <SavedFavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectSpot={handlePinClick}
        onRemoveFavorite={(id) => setFavorites((prev) => prev.filter((f) => f.id !== id))}
        onClearAll={() => setFavorites([])}
      />

      {/* Footer */}
      <footer className="w-full py-3 px-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50">
        <p className="flex items-center justify-center gap-1">
          <span>Open source & free forever. Powered by</span>
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 underline font-semibold hover:text-emerald-500"
          >
            OpenStreetMap
          </a>
          <span>&</span>
          <a
            href="https://maplibre.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 underline font-semibold hover:text-emerald-500"
          >
            MapLibre GL
          </a>
        </p>
      </footer>

    </div>
  );
}
