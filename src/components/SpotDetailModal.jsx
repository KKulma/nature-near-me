import React from 'react';
import { X, MapPin, Footprints, Bike, Car, Heart, Compass, ExternalLink, Download, Share2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function SpotDetailModal({
  spot,
  onClose,
  isFavorite,
  onToggleFavorite,
  userLocation
}) {
  if (!spot) return null;

  const { name, categoryLabel, distanceKm, walkMin, bikeMin, driveMin, tags, osmUrl, centroid } = spot.properties;
  const coords = centroid || (
    spot.geometry.type === 'Point' 
      ? spot.geometry.coordinates 
      : spot.geometry.coordinates[0]
  );

  const lng = coords ? coords[0] : userLocation.lng;
  const lat = coords ? coords[1] : userLocation.lat;

  // External Navigation Links
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=walking`;
  const appleMapsUrl = `https://maps.apple.com/?saddr=${userLocation.lat},${userLocation.lng}&daddr=${lat},${lng}&dirflg=w`;
  const osmDirectionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${userLocation.lat}%2C${userLocation.lng}%3B${lat}%2C${lng}`;

  // Download GPX Location File
  const handleDownloadGPX = () => {
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="NatureNearMe">
  <wpt lat="${lat}" lon="${lng}">
    <name>${escapeXml(name)}</name>
    <desc>${escapeXml(categoryLabel)} - Discovered via Nature Near Me</desc>
  </wpt>
</gpx>`;

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_location.gpx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Spot Category & Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
              {categoryLabel}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Free Public Access
            </span>
          </div>
          <h2 className="font-extrabold text-2xl text-slate-900 dark:text-slate-50 leading-snug">
            {name}
          </h2>
        </div>

        {/* Distance & Travel Metrics */}
        <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 text-center">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Distance</p>
            <p className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">{distanceKm} km</p>
          </div>
          <div className="space-y-0.5 border-x border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Walk Time</p>
            <p className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1">
              <Footprints className="w-4 h-4 text-emerald-500" /> ~{walkMin}m
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Cycle Time</p>
            <p className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1">
              <Bike className="w-4 h-4 text-emerald-500" /> ~{bikeMin}m
            </p>
          </div>
        </div>

        {/* OSM Attributes & Tags */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Features & Dimensions</h4>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              🌐 Coords: {lat.toFixed(4)}, {lng.toFixed(4)}
            </span>
            {spot.properties.areaHectares > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm">
                📐 Area: {spot.properties.areaHectares} hectares (~{(spot.properties.areaHectares * 2.471).toFixed(1)} acres)
              </span>
            )}
            {spot.properties.lengthKm > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-sm">
                🥾 Path Length: {spot.properties.lengthKm} km
              </span>
            )}
            {tags?.operator && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                🏛️ Operator: {tags.operator}
              </span>
            )}
            {tags?.dog && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                🐕 Dogs: {tags.dog}
              </span>
            )}
            {tags?.surface && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                🥾 Surface: {tags.surface}
              </span>
            )}
            {tags?.wheelchair && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                ♿ Access: {tags.wheelchair}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Directions In</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Compass className="w-4 h-4" /> Google Maps
            </a>

            <a
              href={appleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <ExternalLink className="w-4 h-4" /> Apple Maps
            </a>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onToggleFavorite(spot)}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                isFavorite
                  ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                  : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-rose-500/50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : 'text-rose-500'}`} />
              {isFavorite ? 'Saved in Favorites' : 'Save Spot'}
            </button>

            <button
              onClick={handleDownloadGPX}
              className="px-3 py-2.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-600 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Download GPX waypoint file"
            >
              <Download className="w-4 h-4" /> GPX
            </button>

            {osmUrl && (
              <a
                href={osmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-600 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="View on OpenStreetMap"
              >
                OSM ↗
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function escapeXml(str) {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
