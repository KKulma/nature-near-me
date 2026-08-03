# 🌲 Nature Near Me

> An open-source, zero-cost web application to help people discover free, public natural spaces (forests, parks, nature reserves, public footpaths, and lakes) within a specified radius.

![License](https://img.shields.io/badge/License-MIT-emerald.svg)
![React](https://img.shields.io/badge/React-18.3-blue.svg)
![MapLibre](https://img.shields.io/badge/MapLibre_GL-5.1-teal.svg)
![OpenStreetMap](https://img.shields.io/badge/Data-OpenStreetMap-green.svg)
![Cost](https://img.shields.io/badge/Hosting_Cost-$0/mo-success.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-purple.svg)

---

## 🌟 Mission

The goal of **Nature Near Me** is to encourage people to spend time outdoors by making free, public natural spaces easy to discover. Built with 100% open-source tools and public datasets, it requires **no paid API keys, no server infrastructure, and zero maintenance fees**.

---

## ✨ Key Features

- **🗺️ Hardware-Accelerated Vector Map**: Powered by **MapLibre GL JS** and **OpenFreeMap** for smooth 60fps vector map rendering. Supports 4 tile styles (OpenFreeMap Vector, Outdoors & Topo, Light Minimal, Dark Woods).
- **🌿 Live OpenStreetMap Queries**: Queries the **Overpass API** in real-time for parks, ancient woodlands, nature reserves, public footpaths, and lakes.
- **📐 Pre-Filtering by Area & Length**: Uses **Turf.js** spatial analysis to calculate area in **hectares** and footpath length in **kilometers**, allowing users to filter out tiny green patches or short footpaths.
- **⚡ IndexedDB Client Caching**: Uses `idb-keyval` to cache geospatial query responses locally for 30 minutes, preventing duplicate API requests and eliminating rate limits.
- **📍 Location Search & Geolocation**: Instant browser "Near Me" location detection + global city/postcode search via OpenStreetMap **Nominatim**.
- **🧭 Directions & GPX Export**: One-click navigation links to Google Maps, Apple Maps, and OpenStreetMap, plus direct **GPX waypoint file downloads** for GPS devices and fitness trackers.
- **💖 Local Favorites**: Save favorite nature spots locally via browser `localStorage`.
- **📱 Mobile PWA Ready**: Installable directly to mobile home screens with offline shell caching (`vite-plugin-pwa`).

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Browser / PWA (React 18 + Vite)             │
│                                                             │
│  ┌────────────────────┐          ┌───────────────────────┐  │
│  │   UI & Components  │          │ Vector Map Engine     │  │
│  │ (Header, Filters,  │          │  (MapLibre GL JS)     │  │
│  │  Sidebar, Modal)   │          └───────────┬───────────┘  │
│  └──────────┬─────────┘                      │              │
└─────────────┼────────────────────────────────┼──────────────┘
              │ Spatial Math &                 │ Tile Fetching
              │ Client Caching                 │ ($0 Fee)
              ▼                                ▼
   ┌────────────────────┐          ┌───────────────────────┐
   │ Turf.js &          │          │ OpenFreeMap /         │
   │ IndexedDB Layer    │          │ Carto Vector Tiles    │
   └──────────┬─────────┘          └───────────────────────┘
              │ Live Spatial Query
              ▼
   ┌────────────────────┐
   │ Overpass API       │
   │ (OpenStreetMap)    │
   └────────────────────┘
```

---

## 📂 Targeted OpenStreetMap Tags

| Space Type | Targeted OSM Tags | Minimum Default Filter |
| :--- | :--- | :--- |
| **Parks & Gardens** | `leisure=park`, `leisure=garden`, `leisure=recreation_ground` | 0.5 hectares (~1.2 acres) |
| **Forests & Woods** | `landuse=forest`, `natural=wood` (`access!=private`) | 0.5 hectares (~1.2 acres) |
| **Nature Reserves** | `leisure=nature_reserve`, `boundary=protected_area`, `boundary=national_park` | 0.5 hectares (~1.2 acres) |
| **Public Footpaths** | `highway=footway` (`foot=designated`), `highway=path`, `highway=bridleway` | 0.2 km (200 meters) |
| **Lakes & Water** | `natural=water`, `waterway=riverbank` | — |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Local Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/nature-near-me.git
   cd nature-near-me
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🌐 Free Deployment ($0 / Month)

Because **Nature Near Me** is a static client-side Single Page Application (SPA), you can host it for free on any modern static web host:

### Deploying to Cloudflare Pages / Vercel / Netlify

1. Connect your GitHub repository to Cloudflare Pages, Vercel, or Netlify.
2. Set the build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Click **Deploy**! No environment variables or API keys are required.

---

## 📜 License & Acknowledgments

This project is licensed under the **MIT License**.

### Data & Map Attribution
- Map tiles provided by [OpenFreeMap](https://openfreemap.org) and [CartoDB](https://carto.com).
- Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) under Open Database License (ODbL).
- Map rendering by [MapLibre GL JS](https://maplibre.org).
- Spatial calculations by [Turf.js](https://turfjs.org).
