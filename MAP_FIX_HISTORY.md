# Nature Near Me - Map Centering & Rendering Tracking Log

> **Note to Agents**: This document tracks ongoing changes, code modifications relative to git commits, current functional state, resulting map behaviors, and explicit user feedback. Do **not** declare any issue finalized or fixed until explicitly confirmed by the user.

---

## 1. Commit Baseline & Current Revision State

- **Latest Git Commit**: `28085ce4c55db9825d5ef5c97f621ba0659a8324`
  - *Commit Title*: `fix(filtering): default Min Area filter to Any (0 ha)`
  - *Branch*: `main` (16 commits ahead of origin)
- **Uncommitted Modifications**:
  - [`src/App.jsx`](file:///Users/user/MEGAsync/projects/nature-near-me/src/App.jsx): Passed `activeCategory` and `isLoading` props to `<MapLibreView />`.
  - [`src/components/MapLibreView.jsx`](file:///Users/user/MEGAsync/projects/nature-near-me/src/components/MapLibreView.jsx): Added style-load queueing for `flyTo` so geolocation/user location camera moves execute reliably even if style tiles are actively loading; camera flyTo disabled for filter/category/radius changes; added `ResizeObserver` on `mapContainer`; removed `backdrop-filter` blur CSS from all map overlays.

---

## 2. Functional State Breakdown

### What Works
1. **Search Bar & "Near Me" Location Button**:
   - Explicitly searching a location or clicking "Near Me" flies the map camera to the target location.
2. **Explicit Spot Pin & Sidebar Clicks**:
   - Clicking a spot pin or sidebar item sets `selectedSpot` and flies the map camera to the spot centroid at zoom level 14.5.
3. **Filter & Category Changes Without Camera Jump**:
   - Changing category pills or radius updates markers and radius circle on the map **without** jumping or animating the map camera.
4. **WebGL Viewport Resizing (Fix Attempt 4)**:
   - Added `ResizeObserver` to `mapContainer` in `MapLibreView.jsx` to trigger `map.resize()` whenever CSS Grid/Flexbox dimensions update. Prevents map tile, road, and marker distortion.

### What Needs User Verification / Outstanding Behavior
1. **Initial Geolocation Camera Move Reliability (Fix Attempt 5)**:
   - Queued initial camera `flyTo` calls when `!map.current.isStyleLoaded()`, ensuring browser geolocation resolves smoothly to the user's actual current location once tiles mount.
   - *Status*: Implemented in working tree. Pending user testing.

---

## 3. Log of Ongoing Changes & Resulting Behavior

| Revision / Change | Target Code Location | Action Taken | Resulting Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Change #1** | `MapLibreView.jsx` & `index.css` | Removed all `backdrop-filter: blur(...)` and `.glass-panel` classes from map overlays. Replaced with solid/semi-transparent badges (`bg-white/95 dark:bg-slate-900/95`). | Map canvas tiles remain 100% sharp and crisp without GPU canvas blurring. | Pending User Verification |
| **Change #2** | `MapLibreView.jsx` | Removed `flyTo` camera triggers on `categoryChanged` and `radiusChanged`. | Filter changes update markers on map without jumping/moving the map camera. | Pending User Verification |
| **Change #3** | `MapLibreView.jsx` | Retained `flyTo` ONLY for explicit spot pin clicks, sidebar item clicks, and user location searches. | Camera stays strictly stationary during filter tweaks; moves ONLY on explicit spot selection or location search. | Pending User Verification |
| **Change #4** | `MapLibreView.jsx` | Added `ResizeObserver` watching `mapContainer.current` that calls `map.current.resize()`. Added `map.on('load', ...)` resize trigger. | Fixes WebGL viewport aspect ratio mismatch when CSS Grid stretches map container height, preventing vertical tile and road distortion. | Pending User Verification |
| **Change #5** | `MapLibreView.jsx` | Queued `flyTo` calls using `map.current.isStyleLoaded()` check and `map.once('load', ...)` fallback. | Fixes dropped/ignored `flyTo` calls when geolocation resolves while tile style is loading, ensuring map flies to current location on startup/search. | Superseded by Change #6 |
| **Change #6** | `MapLibreView.jsx` | Refactored camera controller using a single unified `pendingCameraTargetRef` and `lastAppliedCameraIdRef`. Listens on `load` and `styledata` events to safely apply target transitions without duplicate event listeners. Camera moves ONLY when `userLocation` coordinates change or `selectedSpot` is selected. | On load: centers on current geolocation (if confirmed) or default/searched location. Filter tweaks (category/radius/area): camera stays strictly stationary while markers and radius circle update in place. | **Confirmed by User** |
| **Change #7** | `App.jsx` | Fixed CSS Grid container height stretching bug. Changed map and sidebar layout containers from dynamic `lg:h-auto` to fixed `lg:h-[640px]`. | Prevents CSS grid row expansion when site list loads, stopping WebGL viewport height shifts that caused camera jumping upon site fetch completion. | **Confirmed by User** |

---

## 4. User Feedback Log

| Timestamp | User Feedback Received | Corresponding Fix Attempt / Action | Status / Result |
| :--- | :--- | :--- | :--- |
| **2026-08-10 15:35** | *"map of start is blurred and shows unclear location and when changing sitrs categories, it goes to the top location, not the current one."* | Removed full-container `backdrop-blur` loading overlay from `MapLibreView.jsx`. Added `activeCategory` prop to track categories. | Initial refactor. |
| **2026-08-10 15:39** | *"log any attempted fixes alongside my feedback. Let me test the latest changes now"* | Created Section 4 (User Feedback Log) in `MAP_FIX_HISTORY.md`. | Ongoing tracking initialized. |
| **2026-08-10 15:45** | *1. Default sites load ok on start.<br>2. Changing filter to radius 10km makes map jump to Oxford.<br>3. Switching category jumps again & shows blurred map.* | **Fix Attempt 3**:<br>1. Completely removed camera `flyTo` triggers on radius or category filter changes so filter changes NEVER jump the camera.<br>2. Removed all `backdrop-filter` CSS from map overlays to eliminate GPU canvas blurring completely.<br>3. Camera moves ONLY when clicking a spot or searching a location. | Implemented in working tree. |
| **2026-08-10 15:47** | *"now the default location is distorted, see attached file"* | **Fix Attempt 4**:<br>Identified WebGL canvas aspect ratio distortion caused by CSS Grid container height settling without triggering MapLibre `map.resize()`. Added a `ResizeObserver` on `mapContainer` and `map.on('load')` handler to execute `map.resize()`, locking viewport aspect ratio 1:1. | Implemented in working tree. |
| **2026-08-10 15:49** | *"now the map doesn't even go to the current location"* | **Fix Attempt 5**:<br>Identified that calling `map.current.flyTo(...)` while `!map.current.isStyleLoaded()` caused MapLibre GL to silently drop the camera transition when browser geolocation resolved during initial tile loading. Added a style-loaded check that queues camera transitions via `map.once('load', ...)` if tiles are loading. | Implemented in working tree. |
| **2026-08-11 11:23** | *"Nature Near Me shows a problematic behaviour of not staying centered on the current / chosen location when switching between different filters..."* | **Fix Attempt 6**:<br>Refactored MapLibreView camera management using `pendingCameraTargetRef` & `lastAppliedCameraIdRef`. | Implemented & Verified. |
| **2026-08-11 11:39** | *"1. on load, the map correctly centers around the current location WHILE THE SITES ARE LOADING. 2. however, as soon as they have been loaded, the map jumps to (presumably the first) area on the list. 3. this behaviour is true for all filter changes... 4. If specified filters don't result in any areas, the map stays correctly centrered"* | **Fix Attempt 7**:<br>Identified CSS Grid container height stretching bug. When `natureSpaces` loaded, sidebar height expanded from ~150px (spinner) to ~1200px (cards), which stretched the map container height (`lg:h-auto`) and forced MapLibre `map.resize()` to shift WebGL canvas center. Fixed container heights to fixed `lg:h-[640px]`, eliminating camera jumps when sites load. | **Verified & Confirmed by User** |

---

## 5. Guidelines for Future Agents

1. **Do not declare issues closed/fixed**: Always report status as "Proposed / Pending User Verification" until the user explicitly confirms satisfaction.
2. **Queue `map.flyTo` calls if `!map.current.isStyleLoaded()`** using `map.once('load', ...)` to prevent dropped camera transitions during initial tile loading.
3. **Always include a `ResizeObserver` on `mapContainer` calling `map.resize()`** to prevent WebGL canvas aspect ratio distortion in CSS Grid/Flexbox layouts.
4. **Never trigger `map.flyTo` on filter, radius, or category state changes**. Filter updates must only mutate data/markers without camera jumps.
5. **Never apply `backdrop-filter: blur(...)` to overlays inside `MapLibreView.jsx`**, as WebKit/Blink backdrop filters cause GPU canvas blurring over MapLibre GL containers.
6. **Always log user feedback alongside attempted fixes** in Section 4 of this document.
7. **Maintain reference to baseline commit `28085ce4c55db9825d5ef5c97f621ba0659a8324`** when describing uncommitted changes.
