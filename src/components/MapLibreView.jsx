import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import * as turf from '@turf/turf';
import { Layers, Navigation, Compass, Maximize2 } from 'lucide-react';

const MAP_STYLES = [
  { id: 'bright', name: 'OpenFreeMap Vector', url: 'https://tiles.openfreemap.org/styles/bright' },
  { id: 'liberty', name: 'Outdoors & Topo', url: 'https://tiles.openfreemap.org/styles/liberty' },
  { id: 'positron', name: 'Light Minimal', url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' },
  { id: 'dark', name: 'Dark Woods', url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' },
];

export default function MapLibreView({
  userLocation,
  radiusKm,
  activeCategory,
  natureSpaces,
  selectedSpot,
  onSelectSpot,
  isDarkMode,
  isLoading
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const [activeStyleUrl, setActiveStyleUrl] = useState(MAP_STYLES[0].url);
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  const pendingCameraTargetRef = useRef(null);
  const lastAppliedCameraIdRef = useRef(null);

  // Helper to determine optimal zoom level based on search radius
  const getZoomForRadius = (r) => {
    if (r <= 1) return 14;
    if (r <= 3) return 13;
    if (r <= 5) return 12.5;
    if (r <= 10) return 11.5;
    return 10;
  };

  // Helper to apply pending camera transition safely when style is ready
  const applyPendingCamera = () => {
    if (!map.current || !pendingCameraTargetRef.current) return;
    const target = pendingCameraTargetRef.current;
    if (lastAppliedCameraIdRef.current === target.id) return;

    if (map.current.isStyleLoaded()) {
      if (target.animate) {
        map.current.flyTo({
          center: target.center,
          zoom: target.zoom,
          essential: true,
          duration: 1000
        });
      } else {
        map.current.jumpTo({
          center: target.center,
          zoom: target.zoom
        });
      }
      lastAppliedCameraIdRef.current = target.id;
      pendingCameraTargetRef.current = null;
    }
  };

  // Render Radius Circle Source & Layer
  const renderRadiusCircle = () => {
    if (!map.current || !map.current.isStyleLoaded() || !userLocation) return;
    const { lat, lng } = userLocation;

    const circleGeoJSON = turf.circle([lng, lat], radiusKm, {
      steps: 64,
      units: 'kilometers'
    });

    if (map.current.getSource('radius-circle-source')) {
      map.current.getSource('radius-circle-source').setData(circleGeoJSON);
    } else {
      map.current.addSource('radius-circle-source', {
        type: 'geojson',
        data: circleGeoJSON,
      });

      map.current.addLayer({
        id: 'radius-circle-fill',
        type: 'fill',
        source: 'radius-circle-source',
        paint: {
          'fill-color': '#10b981',
          'fill-opacity': 0.08,
        },
      });

      map.current.addLayer({
        id: 'radius-circle-line',
        type: 'line',
        source: 'radius-circle-source',
        paint: {
          'line-color': '#10b981',
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      });
    }
  };

  // Initialize Map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Queue initial camera position
    pendingCameraTargetRef.current = {
      center: [userLocation.lng, userLocation.lat],
      zoom: getZoomForRadius(radiusKm),
      id: `user-${userLocation.lat}-${userLocation.lng}`,
      animate: false
    };

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: activeStyleUrl,
      center: [userLocation.lng, userLocation.lat],
      zoom: getZoomForRadius(radiusKm),
      attributionControl: false,
    });

    // Navigation Controls
    map.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    // Handle initial style load and canvas resize
    map.current.on('load', () => {
      if (map.current) {
        map.current.resize();
        applyPendingCamera();
        renderRadiusCircle();
      }
    });

    // Handle style changes or tile reload
    map.current.on('styledata', () => {
      if (map.current && map.current.isStyleLoaded()) {
        applyPendingCamera();
        renderRadiusCircle();
      }
    });

    // Observe container size changes (CSS Grid / Flexbox layout adjustments)
    const resizeObserver = new ResizeObserver(() => {
      if (map.current) {
        map.current.resize();
      }
    });

    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle Style Switch
  const isFirstStyleRender = useRef(true);
  useEffect(() => {
    if (!map.current) return;
    if (isFirstStyleRender.current) {
      isFirstStyleRender.current = false;
      return;
    }
    map.current.setStyle(activeStyleUrl);
  }, [activeStyleUrl]);

  // Handle User Location changes (fly camera ONLY when coordinates explicitly change)
  const prevUserLocationRef = useRef(null);

  useEffect(() => {
    if (!map.current) return;

    const { lat, lng } = userLocation;
    const prevLoc = prevUserLocationRef.current;
    const locChanged = !prevLoc || prevLoc.lat !== lat || prevLoc.lng !== lng;
    prevUserLocationRef.current = userLocation;

    if (locChanged) {
      const zoomLevel = getZoomForRadius(radiusKm);
      pendingCameraTargetRef.current = {
        center: [lng, lat],
        zoom: zoomLevel,
        id: `user-${lat}-${lng}`,
        animate: Boolean(prevLoc) // animate if changing from an existing location
      };
      applyPendingCamera();
    }

    // Custom HTML Marker for User Location
    if (userMarkerRef.current) userMarkerRef.current.remove();

    const el = document.createElement('div');
    el.className = 'relative flex items-center justify-center';
    el.innerHTML = `
      <div class="w-6 h-6 rounded-full bg-emerald-500 border-3 border-white dark:border-slate-900 shadow-xl user-location-pulse flex items-center justify-center">
        <div class="w-2 h-2 rounded-full bg-white"></div>
      </div>
    `;

    userMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map.current);

    renderRadiusCircle();
  }, [userLocation, radiusKm]);

  // Helper to extract clean [lng, lat] centroid for any feature type
  const getSpotCoordinates = (space) => {
    if (!space || !space.geometry) return null;
    if (space.properties?.centroid && Array.isArray(space.properties.centroid) && space.properties.centroid.length >= 2) {
      return space.properties.centroid;
    }
    if (space.geometry.type === 'Point' && Array.isArray(space.geometry.coordinates)) {
      return space.geometry.coordinates;
    }
    try {
      const center = turf.centroid(space);
      return center.geometry.coordinates;
    } catch (e) {
      return null;
    }
  };

  // Update Nature Space Markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    natureSpaces.forEach((space) => {
      const coords = getSpotCoordinates(space);

      if (!coords || coords.length < 2) return;

      const isSelected = selectedSpot?.id === space.id;
      const category = space.properties.category || 'park';
      const categoryColor = getCategoryColor(category);
      const iconEmoji = getCategoryIcon(category);

      // Create Custom Element with glowing ring if selected
      const el = document.createElement('div');
      el.className = `group cursor-pointer transition-transform duration-300 w-10 h-10 flex items-center justify-center ${
        isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
      }`;

      el.innerHTML = `
        <div class="relative flex items-center justify-center w-full h-full">
          ${isSelected ? '<div class="absolute -inset-1.5 rounded-full bg-emerald-400/60 animate-ping"></div>' : ''}
          <div class="w-9 h-9 rounded-full ${categoryColor.bg} border-2 ${isSelected ? 'border-amber-300 ring-4 ring-emerald-400 shadow-2xl scale-110' : 'border-white dark:border-slate-900 shadow-md'} flex items-center justify-center text-base transition-all">
            <span>${iconEmoji}</span>
          </div>
        </div>
      `;

      // Direct click handler on pin -> triggers summary popup
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectSpot(space);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  }, [natureSpaces, selectedSpot]);

  // Handle Selected Spot flyTo centering (ONLY when user explicitly clicks a spot pin or sidebar item)
  useEffect(() => {
    if (!map.current || !selectedSpot) return;

    const coords = getSpotCoordinates(selectedSpot);
    if (coords && coords.length >= 2) {
      pendingCameraTargetRef.current = {
        center: coords,
        zoom: 14.5,
        id: `spot-${selectedSpot.id}`,
        animate: true
      };
      applyPendingCamera();
    }
  }, [selectedSpot]);

  return (
    <div className="relative w-full h-full min-h-[450px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
      
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Non-intrusive Crisp Loading Badge (Solid background without backdrop-blur overlay over map canvas) */}
      {isLoading && (
        <div className="absolute top-3 right-14 z-20 animate-in fade-in duration-200 pointer-events-none">
          <div className="px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100">
            <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">
              Updating spots...
            </span>
          </div>
        </div>
      )}

      {/* Map Layer Switcher Control */}
      <div className="absolute top-3 left-3 z-20">
        <div className="relative">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-md text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all flex items-center gap-2 text-xs font-bold"
            title="Change Map Style"
          >
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Map Layers</span>
          </button>

          {showStyleMenu && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-30 animate-in fade-in zoom-in-95 duration-150">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Select Tile Layer
              </p>
              {MAP_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setActiveStyleUrl(style.url);
                    setShowStyleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeStyleUrl === style.url
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  <span>{style.name}</span>
                  {activeStyleUrl === style.url && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-20 hidden md:block">
        <div className="bg-white/95 dark:bg-slate-900/95 px-3 py-2 rounded-2xl shadow-md border border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-700 dark:text-slate-200 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Park/Forest</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <span>Reserve</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Footpath</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span>Water</span>
          </div>
        </div>
      </div>

    </div>
  );
}

function getCategoryColor(category) {
  switch (category) {
    case 'forest':
      return { bg: 'bg-emerald-600', text: 'text-emerald-600' };
    case 'reserve':
      return { bg: 'bg-teal-600', text: 'text-teal-600' };
    case 'trail':
      return { bg: 'bg-amber-500', text: 'text-amber-500' };
    case 'water':
      return { bg: 'bg-sky-500', text: 'text-sky-500' };
    default:
      return { bg: 'bg-emerald-500', text: 'text-emerald-500' };
  }
}

function getCategoryIcon(category) {
  switch (category) {
    case 'forest': return '🌲';
    case 'reserve': return '🦅';
    case 'trail': return '🥾';
    case 'water': return '🌊';
    default: return '🏞️';
  }
}
