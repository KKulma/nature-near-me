/**
 * Curated sample natural spaces used for initial instant loading, offline mode,
 * or as a fallback if the public Overpass API endpoints are unreachable.
 */
export const SAMPLE_NATURE_SPACES = [
  {
    id: 'sample-1',
    name: 'Epping Forest & Queen Elizabeth Oak',
    category: 'forest',
    categoryLabel: 'Forest & Ancient Woods',
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [0.0478, 51.6582]
    },
    properties: {
      id: 'sample-1',
      name: 'Epping Forest & Queen Elizabeth Oak',
      category: 'forest',
      categoryLabel: 'Forest & Ancient Woods',
      description: 'Ancient royal woodland spanning over 2,400 hectares with veteran oak trees, ponds, and miles of public footpaths.',
      access: 'public',
      tags: {
        'landuse': 'forest',
        'natural': 'wood',
        'operator': 'City of London Corporation',
        'surface': 'dirt',
        'dog_friendly': 'yes',
        'wheelchair': 'limited',
      },
      osmUrl: 'https://www.openstreetmap.org/relation/1125211',
      rating: 4.8,
      facilities: ['Parking', 'Public Footpaths', 'Visitor Centre', 'Dog Friendly', 'Ponds']
    }
  },
  {
    id: 'sample-2',
    name: 'Richmond Park & Deer Reserve',
    category: 'reserve',
    categoryLabel: 'Nature Reserve & Wildlife',
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-0.2743, 51.4463]
    },
    properties: {
      id: 'sample-2',
      name: 'Richmond Park & Deer Reserve',
      category: 'reserve',
      categoryLabel: 'Nature Reserve & Wildlife',
      description: 'The largest of London’s Royal Parks, famous for its free-roaming red and fallow deer, ancient oaks, and Isabella Plantation.',
      access: 'public',
      tags: {
        'leisure': 'nature_reserve',
        'boundary': 'protected_area',
        'protection_title': 'Site of Special Scientific Interest',
        'dog_friendly': 'yes_on_lead',
        'wheelchair': 'yes',
      },
      osmUrl: 'https://www.openstreetmap.org/relation/934988',
      rating: 4.9,
      facilities: ['Free Public Access', 'Deer Watching', 'Paved Trails', 'Café', 'Accessible Paths']
    }
  },
  {
    id: 'sample-3',
    name: 'Hampstead Heath & Parliament Hill Lookout',
    category: 'park',
    categoryLabel: 'Town Park & Common',
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-0.1652, 51.5606]
    },
    properties: {
      id: 'sample-3',
      name: 'Hampstead Heath & Parliament Hill Lookout',
      category: 'park',
      categoryLabel: 'Town Park & Common',
      description: 'Wild and grassy parkland providing panoramic views over London skyline, swimming ponds, and wooded walking trails.',
      access: 'public',
      tags: {
        'leisure': 'park',
        'opening_hours': '24/7',
        'swimming': 'designated_ponds',
        'viewpoint': 'yes',
      },
      osmUrl: 'https://www.openstreetmap.org/way/4621045',
      rating: 4.7,
      facilities: ['Panoramic View', 'Natural Ponds', 'Footpaths', 'Benches', 'Bathing Ponds']
    }
  },
  {
    id: 'sample-4',
    name: 'Thames Path National Trail - Kew Reach',
    category: 'trail',
    categoryLabel: 'Public Footpath & Hiking Trail',
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
        [-0.2882, 51.4822],
        [-0.2780, 51.4870],
        [-0.2650, 51.4860],
        [-0.2520, 51.4830]
      ]
    },
    properties: {
      id: 'sample-4',
      name: 'Thames Path National Trail - Kew Reach',
      category: 'trail',
      categoryLabel: 'Public Footpath & Hiking Trail',
      description: 'Scenic public riverside footpath along the River Thames past royal gardens, historic pubs, and willow-lined riverbanks.',
      access: 'public',
      tags: {
        'highway': 'footway',
        'route': 'hiking',
        'surface': 'gravel/paved',
        'foot': 'designated',
      },
      osmUrl: 'https://www.openstreetmap.org/relation/30419',
      rating: 4.8,
      facilities: ['River Views', 'Car Free', 'Flat Walking', 'Benches', 'Pub Access']
    }
  },
  {
    id: 'sample-5',
    name: 'Serpentine Lake & Kensington Gardens',
    category: 'water',
    categoryLabel: 'Lake & Waterbody',
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-0.1690, 51.5050]
    },
    properties: {
      id: 'sample-5',
      name: 'Serpentine Lake & Kensington Gardens',
      category: 'water',
      categoryLabel: 'Lake & Waterbody',
      description: 'Historic 40-acre recreational lake surrounded by tree-lined avenues, gardens, and waterfowl bird sanctuaries.',
      access: 'public',
      tags: {
        'natural': 'water',
        'water': 'lake',
        'leisure': 'park',
      },
      osmUrl: 'https://www.openstreetmap.org/way/4621046',
      rating: 4.6,
      facilities: ['Boat Hire', 'Wildlife Birding', 'Paved Promenades', 'Café', 'Accessible']
    }
  }
];
