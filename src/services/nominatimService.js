/**
 * Search locations using OpenStreetMap Nominatim API
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'NatureNearMe-WebApp/1.0'
      }
    });

    if (!res.ok) throw new Error(`Search failed: ${res.status}`);

    const data = await res.json();
    return data.map(item => ({
      id: item.place_id,
      displayName: item.display_name,
      shortName: item.name || item.display_name.split(',')[0],
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
      category: item.category
    }));
  } catch (err) {
    console.error('Nominatim geocode error:', err);
    return [];
  }
}
