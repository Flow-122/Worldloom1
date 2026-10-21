# Worldloom

A travel and curiosity app for collecting little guides — the curated collections, the
places they point to, and an interactive globe you can spin and search.

Built with React 19 and Vite. Five single-page views, hash routing, and no backend.

## Running it

```bash
npm install
npm run dev      # start the Vite dev server
npm run build    # emit a production bundle into dist/
npm run preview  # serve the built bundle
```

Requires Node 18+ (Vite 6). Verified on Node 24.21.0 / npm 11.19.0.

## What it does

| Page | Hash | Behavior |
| --- | --- | --- |
| Discover | `#discover` | Hero search, side-quest progress, topic filters. Search matches collections locally, then falls back to the Wikipedia API for illustrated results. |
| Collections | `#collections` | Filterable grid of guides by topic (Design, Places, Ideas) over a rotating photo wallpaper. Cards open a gallery modal. |
| World Map | `#world-map` | Three.js globe with drag-rotate and scroll-zoom, place search, flag-color matching, region browser, geolocation. |
| Portfolio | `#portfolio` | Editable creator name and bio, drag-and-drop image upload, featured work grid. |
| Saved | `#saved` | Same grid as Collections, filtered to hearts you have saved. |

Navigation is hash-based (`window.history.pushState` plus `hashchange`/`popstate`
listeners), so every view is linkable and back/forward works. The active page is read
back out of `location.hash` on mount.

### Collections

The 10 collections live in a plain array at the top of `src/App.jsx`. Each entry needs
`id`, `title`, `place`, `category` (one of the three topics), `note`, `image`,
`imageAlt`, `color`, and `minutes`. Gallery photos beyond the cover come from
`collectionGalleryPhotos`, keyed by collection `id`.

Search is a loose substring match across title, place, category, and note, with a naive
plural fold (`spots` matches `spot`). It is not fuzzy and not ranked.

### Persistence

Three `localStorage` keys, all written through the same helpers:

- `worldloom-saved-collections` — collection ids with a heart
- `worldloom-opened-collections` — collection ids opened, capped at 10 for the progress card
- `worldloom-collected-map-places` — map places collected

Reads filter out unknown ids and de-duplicate, so editing the `collections` array can
never leave dangling references. Every read and write is wrapped in `try`/`catch`, so a
blocked or full storage area degrades to in-memory state instead of crashing.

Portfolio uploads are **not** persisted. They live in component state as object URLs and
are lost on reload. The profile completion bar is a hardcoded `78%` and does not
reflect actual field contents.

## External dependencies

Everything below is loaded from a CDN at runtime. The app degrades rather than breaks
when any of it fails, but offline use is heavily reduced.

- **three.js 0.149.0** — via `<script>` in `index.html`, read as `window.THREE`. The globe
  bails out cleanly if it is missing and shows a static fallback image.
- **Tailwind CSS** — injected at runtime from `cdn.tailwindcss.com` by a `useEffect` in
  `App.jsx`, guarded by a `[data-worldloom-tailwind]` marker. Not a build-time
  dependency; this is the JIT-in-browser mode, so it is dev-oriented and slower in
  production than a compiled Tailwind setup would be.
- **Fonts** — DM Sans via `index.html`, plus DM Sans and Space Grotesk injected by
  `App.jsx`.
- **Wikipedia REST API** — discover-page fallback search, debounced 250 ms, aborted on
  keystroke change, cached per query in a `Map` ref.
- **world-countries 5.0.0** and **country-state-city 3.2.1** — via jsDelivr, for the
  country and state lists on the map page.
- **flagcdn.com** — flag images, sampled to a color palette on canvas for the
  flag-color filter.
- **Unsplash** — all editorial photography.

## Project layout

```
index.html          entry document; loads fonts and three.js
src/main.jsx        React root; imports worldloom.css
src/App.jsx         collections data, routing, search, all page views, scoped <style>
src/AtlasMap.jsx    three.js globe, place search, region browser, flag matching
src/atlas-map.css   styles for the atlas section only
src/map.png         unused
worldloom.css       design tokens and legacy styles, imported by main.jsx
worldloom.html      standalone single-file prototype, not part of the build
worldloom.js        prototype behavior for the above
index.css           empty; not imported
modern.png          unused
dist/               build output
```

`src/App.jsx` is around 1000 lines and mixes data, logic, markup, and a large scoped
`<style>` block. `worldloom.html` and `worldloom.js` are an earlier vanilla-JS version of
the same product; they are standalone and nothing references them.

## Notes for future work

- Three.js and Tailwind are both CDN-pinned by hand, with no integrity hashes. Moving to
  npm dependencies would make the build reproducible and remove the runtime CDN
  dependency.
- `worldloom.css` is imported globally by `main.jsx`, but most of it targets selectors
  from the old `worldloom.html` prototype. The React app styles itself through the
  scoped `<style>` block in `App.jsx` plus Tailwind. Worth pruning.
- The flag-color match runs up to 10 concurrent canvas samplers over every country on
  each selection change. It is cached per country code, but the first pass is heavy.
- No test setup, no linter, and no formatter config in the repo.