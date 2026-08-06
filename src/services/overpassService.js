import * as turf from '@turf/turf';
import { getCacheKey, getCachedData, setCachedData } from './cacheService';
import { SAMPLE_NATURE_SPACES } from './sampleData';

// Public Overpass API mirrors
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

/**
 * Fetch public natural spaces around user location within radius (in km)
 */
export async function fetchNatureSpaces(
  userLat, 
  userLng, 
  radiusKm = 5, 
  categoryFilter = 'all',
  minAreaHectares = 0.5,
  minPathLengthKm = 0.2
) {
  const cacheKey = getCacheKey(userLat, userLng, radiusKm, categoryFilter);
  
  // 1. Try IndexedDB cache first
  const cached = await getCachedData(cacheKey);
  if (cached) {
    console.log('Serving nature spaces from IndexedDB cache ⚡');
    return processFeatures(cached, userLat, userLng, radiusKm, categoryFilter, minAreaHectares, minPathLengthKm);
  }

  // 2. Build Overpass QL query
  const radiusMeters = Math.min(radiusKm * 1000, 25000); // Cap at 25km for performance
  const overpassQuery = buildOverpassQuery(userLat, userLng, radiusMeters, categoryFilter);

  // 3. Query Overpass API with endpoint fallback
  let rawData = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout per endpoint

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(overpassQuery)}`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        rawData = await response.json();
        break;
      }
    } catch (err) {
      console.warn(`Overpass endpoint ${endpoint} failed/timed out, trying next mirror...`);
    }
  }

  // 4. If Overpass APIs fail or time out, fallback to enriched sample data
  if (!rawData || !rawData.elements || rawData.elements.length === 0) {
    console.warn('Using fallback sample data...');
    return processFeatures(SAMPLE_NATURE_SPACES, userLat, userLng, radiusKm, categoryFilter, minAreaHectares, minPathLengthKm);
  }

  // 5. Convert raw OSM elements to clean GeoJSON features
  const geojsonFeatures = convertOsmToGeoJSON(rawData.elements);

  // 6. Cache to IndexedDB for 30 minutes
  await setCachedData(cacheKey, geojsonFeatures);

  // 7. Process spatial metrics with Turf.js
  return processFeatures(geojsonFeatures, userLat, userLng, radiusKm, categoryFilter, minAreaHectares, minPathLengthKm);
}

/**
 * Build Overpass QL syntax
 */
function buildOverpassQuery(lat, lng, radiusMeters, categoryFilter) {
  let tagSelector = '';

  switch (categoryFilter) {
    case 'park':
      tagSelector = `
        nwr["leisure"="park"](around:${radiusMeters},${lat},${lng});
        nwr["leisure"="garden"](around:${radiusMeters},${lat},${lng});
        nwr["leisure"="recreation_ground"](around:${radiusMeters},${lat},${lng});
      `;
      break;
    case 'forest':
      tagSelector = `
        nwr["landuse"="forest"](around:${radiusMeters},${lat},${lng});
        nwr["natural"="wood"](around:${radiusMeters},${lat},${lng});
      `;
      break;
    case 'reserve':
      tagSelector = `
        nwr["leisure"="nature_reserve"](around:${radiusMeters},${lat},${lng});
        nwr["boundary"="protected_area"](around:${radiusMeters},${lat},${lng});
        nwr["boundary"="national_park"](around:${radiusMeters},${lat},${lng});
      `;
      break;
    case 'trail':
      tagSelector = `
        way["highway"="footway"]["foot"="designated"](around:${radiusMeters},${lat},${lng});
        way["highway"="path"](around:${radiusMeters},${lat},${lng});
        way["highway"="bridleway"](around:${radiusMeters},${lat},${lng});
      `;
      break;
    case 'water':
      tagSelector = `
        nwr["natural"="water"](around:${radiusMeters},${lat},${lng});
        nwr["waterway"="riverbank"](around:${radiusMeters},${lat},${lng});
      `;
      break;
    default:
      // 'all' category query
      tagSelector = `
        nwr["leisure"="park"](around:${radiusMeters},${lat},${lng});
        nwr["leisure"="nature_reserve"](around:${radiusMeters},${lat},${lng});
        nwr["landuse"="forest"](around:${radiusMeters},${lat},${lng});
        nwr["natural"="wood"](around:${radiusMeters},${lat},${lng});
        way["highway"="footway"]["foot"="designated"](around:${radiusMeters},${lat},${lng});
        way["highway"="path"](around:${radiusMeters},${lat},${lng});
        nwr["natural"="water"](around:${radiusMeters},${lat},${lng});
      `;
      break;
  }

  return `
    [out:json][timeout:15];
    (
      ${tagSelector}
    );
    out body center 60;
    >;
    out skel qt;
  `;
}

/**
 * Convert OSM raw nodes/ways/relations to standardized GeoJSON
 */
function convertOsmToGeoJSON(elements) {
  const features = [];
  const nodesMap = new Map();

  // Store nodes for way geometry reconstruction
  for (const el of elements) {
    if (el.type === 'node') {
      nodesMap.set(el.id, [el.lon, el.lat]);
    }
  }

  for (const el of elements) {
    if (!el.tags) continue;
    
    // Filter private spaces if specified
    if (el.tags.access === 'private' || el.tags.access === 'no') continue;

    let coords = null;
    let geomType = 'Point';

    if (el.type === 'node') {
      coords = [el.lon, el.lat];
    } else if (el.center) {
      coords = [el.center.lon, el.center.lat];
    } else if (el.type === 'way' && el.nodes && el.nodes.length > 0) {
      const wayCoords = el.nodes.map(nId => nodesMap.get(nId)).filter(Boolean);
      if (wayCoords.length > 1) {
        // If first and last node match, it's a closed Polygon
        const isClosed = wayCoords.length >= 4 && 
          wayCoords[0][0] === wayCoords[wayCoords.length - 1][0] && 
          wayCoords[0][1] === wayCoords[wayCoords.length - 1][1];

        if (isClosed) {
          coords = [wayCoords];
          geomType = 'Polygon';
        } else {
          coords = wayCoords;
          geomType = 'LineString';
        }
      }
    }

    if (!coords) continue;

    const name = el.tags.name || el.tags['name:en'] || formatNameFromTags(el.tags);
    const category = categorizeTags(el.tags);

    features.push({
      id: `${el.type}-${el.id}`,
      type: 'Feature',
      geometry: {
        type: geomType,
        coordinates: coords
      },
      properties: {
        id: `${el.type}-${el.id}`,
        name,
        category: category.id,
        categoryLabel: category.label,
        tags: el.tags,
        osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
        access: el.tags.access || 'public',
        surface: el.tags.surface || 'natural',
        dogFriendly: el.tags.dog || el.tags.dog_friendly || 'unknown',
        wheelchair: el.tags.wheelchair || 'unknown'
      }
    });
  }

  return features;
}

/**
 * Categorize tags into clean category types
 */
function categorizeTags(tags) {
  if (tags.leisure === 'nature_reserve' || tags.boundary === 'protected_area' || tags.boundary === 'national_park') {
    return { id: 'reserve', label: 'Nature Reserve & Wildlife' };
  }
  if (tags.landuse === 'forest' || tags.natural === 'wood') {
    return { id: 'forest', label: 'Forest & Woodland' };
  }
  if (tags.highway === 'footway' || tags.highway === 'path' || tags.highway === 'bridleway') {
    return { id: 'trail', label: 'Public Footpath & Trail' };
  }
  if (tags.natural === 'water' || tags.waterway === 'riverbank') {
    return { id: 'water', label: 'Lake & Waterbody' };
  }
  return { id: 'park', label: 'Public Park & Garden' };
}

/**
 * Fallback name formatter
 */
function formatNameFromTags(tags) {
  if (tags.leisure) return `Public ${tags.leisure.replace('_', ' ')}`;
  if (tags.landuse) return `${tags.landuse.replace('_', ' ')} Woods`;
  if (tags.natural) return `Natural ${tags.natural.replace('_', ' ')}`;
  if (tags.highway) return `Public ${tags.highway.replace('_', ' ')} Trail`;
  return 'Public Natural Space';
}

/**
 * Process features using Turf.js:
 * 1. Compute exact distance from user (in km)
 * 2. Compute area in hectares for polygons/multipolygons
 * 3. Compute length in km for LineStrings/footpaths
 * 4. Filter by radius, category, minimum area, and minimum path length
 * 5. Add estimated walking/biking/driving times
 * 6. Sort by distance ascending
 */
function processFeatures(
  features, 
  userLat, 
  userLng, 
  radiusKm, 
  categoryFilter,
  minAreaHectares = 0.5, // default min 0.5 hectares (~5,000 m²) for woods/parks
  minPathLengthKm = 0.2   // default min 200m for footpaths/trails
) {
  const userPoint = turf.point([userLng, userLat]);

  const processed = features.map(feature => {
    let point = null;
    let areaHectares = 0;
    let lengthKm = 0;

    // Spatial calculations based on geometry type
    try {
      if (feature.geometry.type === 'Point') {
        point = turf.point(feature.geometry.coordinates);
        areaHectares = 0.5;
      } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        point = turf.centroid(feature);
        const areaM2 = turf.area(feature);
        areaHectares = parseFloat((areaM2 / 10000).toFixed(2)); // 1 ha = 10,000 m²
      } else if (feature.geometry.type === 'LineString') {
        const line = turf.lineString(feature.geometry.coordinates);
        point = turf.centroid(line);
        lengthKm = parseFloat(turf.length(line, { units: 'kilometers' }).toFixed(2));
      } else {
        point = turf.centroid(feature);
      }
    } catch (err) {
      // Robust fallback if Turf fails on complex geometry
      let fallbackLng = userLng;
      let fallbackLat = userLat;
      if (feature.geometry.type === 'Point') {
        [fallbackLng, fallbackLat] = feature.geometry.coordinates;
      } else if (Array.isArray(feature.geometry.coordinates)) {
        const flat = feature.geometry.coordinates.flat(Infinity);
        if (flat.length >= 2) {
          fallbackLng = flat[0];
          fallbackLat = flat[1];
        }
      }
      point = turf.point([fallbackLng, fallbackLat]);
    }

    const distanceKm = turf.distance(userPoint, point, { units: 'kilometers' });

    // Travel time estimates
    const walkMin = Math.round((distanceKm / 4.8) * 60); // 4.8 km/h walking
    const bikeMin = Math.round((distanceKm / 15) * 60);  // 15 km/h cycling
    const driveMin = Math.max(1, Math.round((distanceKm / 40) * 60)); // 40 km/h driving

    return {
      ...feature,
      properties: {
        ...feature.properties,
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        areaHectares,
        lengthKm,
        walkMin,
        bikeMin,
        driveMin,
        centroid: point.geometry.coordinates
      }
    };
  });

  // Filter within radius, category, and minimum size/length thresholds
  const filtered = processed.filter(item => {
    const withinRadius = item.properties.distanceKm <= radiusKm;
    const matchesCategory = categoryFilter === 'all' || item.properties.category === categoryFilter;
    
    // Size & Length Pre-filtering
    let passesSizeFilter = true;
    if (minAreaHectares > 0 && (item.properties.category === 'forest' || item.properties.category === 'park' || item.properties.category === 'reserve')) {
      passesSizeFilter = item.properties.areaHectares >= minAreaHectares;
    } else if (minPathLengthKm > 0 && item.properties.category === 'trail') {
      passesSizeFilter = item.properties.lengthKm >= minPathLengthKm;
    }

    return withinRadius && matchesCategory && passesSizeFilter;
  });

  // Sort by distance ascending
  return filtered.sort((a, b) => a.properties.distanceKm - b.properties.distanceKm);
}
