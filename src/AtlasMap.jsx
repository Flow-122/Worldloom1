import { useEffect, useRef, useState } from 'react';
import './atlas-map.css';

const continents = [
  { name: 'Africa', lat: 0, lon: 20 },
  { name: 'Asia', lat: 34, lon: 100 },
  { name: 'Europe', lat: 50, lon: 15 },
  { name: 'North America', lat: 40, lon: -100 },
  { name: 'South America', lat: -15, lon: -60 },
  { name: 'Oceania', lat: -20, lon: 135 }
];
const flagColors = [
  ['red', '#e53935'], ['orange', '#f28c28'], ['yellow', '#e6bd24'], ['green', '#238b45'],
  ['blue', '#2467c9'], ['purple', '#7735a8'], ['white', '#fff'], ['black', '#20242c']
];

function classifyColor(red, green, blue) {
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const saturation = max === 0 ? 0 : delta / max;
  if (max < 52) return 'black';
  if (saturation < 0.2) return max > 190 ? 'white' : null;
  let hue = max === red ? 60 * (((green - blue) / delta) % 6)
    : max === green ? 60 * ((blue - red) / delta + 2)
      : 60 * ((red - green) / delta + 4);
  if (hue < 0) hue += 360;
  if (hue < 15 || hue >= 345) return 'red';
  if (hue < 43) return 'orange';
  if (hue < 70) return 'yellow';
  if (hue < 165) return 'green';
  if (hue < 255) return 'blue';
  return 'purple';
}

function flagPalette(countryCode) {
  return fetch(`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`)
    .then((response) => response.ok ? response.blob() : Promise.reject())
    .then((blob) => createImageBitmap(blob))
    .then((image) => {
      const canvas = document.createElement('canvas');
      canvas.width = 36;
      canvas.height = 24;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const counts = new Map();
      let visible = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index + 3] < 128) continue;
        visible += 1;
        const color = classifyColor(pixels[index], pixels[index + 1], pixels[index + 2]);
        if (color) counts.set(color, (counts.get(color) || 0) + 1);
      }
      image.close();
      return new Set([...counts].filter(([, count]) => count / visible >= 0.035).map(([color]) => color));
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function AtlasMap({ mapPlaces, collectedMapIds, onCollect, onBack, isActive, openedIds, collections }) {
  const [places, setPlaces] = useState(continents.map((place) => ({ ...place, type: 'Continent', continent: place.name })));
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [comparePlace, setComparePlace] = useState(null);
  const [activeContinent, setActiveContinent] = useState('Europe');
  const [subdivisionCountry, setSubdivisionCountry] = useState(null);
  const [showingSubdivisions, setShowingSubdivisions] = useState(false);
  const [view, setView] = useState('explore');
  const [selectedColors, setSelectedColors] = useState([]);
  const [matchingFlags, setMatchingFlags] = useState([]);
  const [flagStatus, setFlagStatus] = useState('Choose colors');
  const [toast, setToast] = useState('');
  const [globeReady, setGlobeReady] = useState(false);
  const [activeHighlightFilter, setActiveHighlightFilter] = useState(null);
  
  const [tick, setTick] = useState(new Date());
  const [syncHour, setSyncHour] = useState(new Date().getUTCHours());
  const [wikiData, setWikiData] = useState({ snippet: '', imageUrl: '' });
  const [loadingWiki, setLoadingWiki] = useState(false);

  const canvasRef = useRef(null);
  const hostRef = useRef(null);
  const globeRef = useRef(null);
  const pinRef = useRef(null);
  const arcRef = useRef(null);
  const flagCache = useRef(new Map());

  // Second-by-second ticker
  useEffect(() => {
    const timer = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const searchText = query.trim().toLocaleLowerCase();
  const suggestions = searchText && searchText !== selected?.name.toLocaleLowerCase() ? places.filter((place) => `${place.name} ${place.continent} ${place.country || ''}`.toLocaleLowerCase().includes(searchText))
    .sort((a, b) => (a.name.toLocaleLowerCase().startsWith(searchText) ? 0 : 1) - (b.name.toLocaleLowerCase().startsWith(searchText) ? 0 : 1)).slice(0, 8) : [];
  
  const regionPlaces = (showingSubdivisions && subdivisionCountry
    ? places.filter((place) => place.type === 'State / province' && place.countryCode === subdivisionCountry.countryCode)
    : places.filter((place) => place.type === 'Country' && place.continent === activeContinent)).sort((a, b) => a.name.localeCompare(b.name));
  
  const curatedPlace = selected && mapPlaces.find((place) => place.name === selected.name || place.name === selected.country);
  const totalOpens = openedIds.length;

  const highlightShare = (terms) => totalOpens
    ? Math.round(openedIds.reduce((count, id) => {
      const collection = collections.find((item) => item.id === id);
      return count + (collection && terms.some((term) => `${collection.title} ${collection.category} ${collection.note}`.toLowerCase().includes(term)) ? 1 : 0);
    }, 0) / totalOpens * 100)
    : 0;

  const exactTzMap = {
    KE: 'Africa/Nairobi', US: 'America/New_York', GB: 'Europe/London', 
    FR: 'Europe/Paris', JP: 'Asia/Tokyo', CN: 'Asia/Shanghai', 
    BR: 'America/Sao_Paulo', AU: 'Australia/Sydney', IN: 'Asia/Kolkata',
    ZA: 'Africa/Johannesburg', DE: 'Europe/Berlin', CA: 'America/Toronto',
    KR: 'Asia/Seoul', NG: 'Africa/Lagos', GH: 'Africa/Accra',
    TZ: 'Africa/Dar_es_Salaam', UG: 'Africa/Kampala', RW: 'Africa/Kigali'
  };

  const getExactTimeZoneTime = (place, utcHourOffset) => {
    if (!place) return { timeStr: '--:--:--', isDay: true };
    try {
      const tz = place.countryCode && exactTzMap[place.countryCode]
        ? exactTzMap[place.countryCode]
        : (place.lon !== undefined 
            ? `Etc/GMT${Math.round(place.lon / 15) <= 0 ? '+' + Math.abs(Math.round(place.lon / 15)) : '-' + Math.abs(Math.round(place.lon / 15))}`
            : 'UTC');

      const targetDate = new Date(tick.getTime());
      if (utcHourOffset !== null) {
        targetDate.setUTCHours(utcHourOffset);
      }

      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const timeStr = formatter.format(targetDate);
      const hourNum = parseInt(timeStr.split(':')[0], 10);
      const isDay = hourNum >= 6 && hourNum < 18;

      return { timeStr, isDay };
    } catch {
      return { timeStr: '12:00:00', isDay: true };
    }
  };

  const getTimeDiffString = (place1, place2) => {
    if (!place1 || !place2) return '';
    const t1 = getExactTimeZoneTime(place1, null).timeStr;
    const t2 = getExactTimeZoneTime(place2, null).timeStr;
    const h1 = parseInt(t1.split(':')[0], 10);
    const h2 = parseInt(t2.split(':')[0], 10);
    let diff = h2 - h1;
    if (diff > 12) diff -= 24;
    if (diff < -12) diff += 24;
    if (diff === 0) return 'Same local time';
    return diff > 0 ? `+${diff} hrs ahead` : `${diff} hrs behind`;
  };

  const selectedLocalTime = getExactTimeZoneTime(selected, syncHour);
  const compareLocalTime = getExactTimeZoneTime(comparePlace, syncHour);

  // Fetch Wikipedia Summary & Image
  useEffect(() => {
    if (!selected) {
      setWikiData({ snippet: '', imageUrl: '' });
      return;
    }
    setLoadingWiki(true);
    const term = encodeURIComponent(selected.name);
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${term}`)
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => {
        setWikiData({
          snippet: data.extract || 'Explore geographic highlights and regional data.',
          imageUrl: data.originalimage?.source || data.thumbnail?.source || 'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=crop&w=800&q=80'
        });
        setLoadingWiki(false);
      })
      .catch(() => {
        setWikiData({
          snippet: 'Explore cultural landmarks, cuisine, and geographic profiles for this destination.',
          imageUrl: 'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=crop&w=800&q=80'
        });
        setLoadingWiki(false);
      });
  }, [selected]);

  useEffect(() => {
    if (isActive) return;
    setSelected(null);
    setComparePlace(null);
    setQuery('');
    setShowingSubdivisions(false);
    setSubdivisionCountry(null);
    setSelectedColors([]);
    setActiveHighlightFilter(null);
  }, [isActive]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('https://cdn.jsdelivr.net/npm/world-countries@5.0.0/countries.json').then((response) => response.json()),
      fetch('https://cdn.jsdelivr.net/npm/country-state-city@3.2.1/lib/assets/state.json').then((response) => response.json())
    ]).then(([countries, states]) => {
      if (cancelled) return;
      const countryPlaces = countries.filter((country) => country.latlng?.length === 2 && country.region).map((country) => ({
        name: country.name.common,
        type: 'Country',
        continent: country.region === 'Americas' ? (country.subregion === 'South America' ? 'South America' : 'North America') : country.region,
        lat: country.latlng[0], lon: country.latlng[1], countryCode: country.cca2,
        capital: country.capital?.[0] || 'Unknown',
        languages: Object.values(country.languages || {})
      }));
      const countriesByCode = new Map(countryPlaces.map((country) => [country.countryCode, country]));
      const statePlaces = states.filter((state) => state.latitude && state.longitude && countriesByCode.has(state.countryCode)).map((state) => {
        const country = countriesByCode.get(state.countryCode);
        return { name: state.name, type: 'State / province', continent: country.continent, country: country.name, lat: Number(state.latitude), lon: Number(state.longitude), countryCode: state.countryCode, capital: country.capital, languages: country.languages };
      });
      setPlaces([...continents.map((place) => ({ ...place, type: 'Continent', continent: place.name })), ...countryPlaces, ...statePlaces]);
      setLoadingPlaces(false);
    }).catch(() => setLoadingPlaces(false));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedColors.length || loadingPlaces) {
      setMatchingFlags([]);
      setFlagStatus(selectedColors.length ? 'Loading countries…' : 'Choose colors');
      return undefined;
    }
    let cancelled = false;
    const candidates = places.filter((place) => place.type === 'Country' && place.countryCode);
    let next = 0;
    let checked = 0;
    const matches = [];
    setFlagStatus(`Checking flags 0 / ${candidates.length}`);
    const worker = async () => {
      while (!cancelled && next < candidates.length) {
        const country = candidates[next++];
        try {
          let palette = flagCache.current.get(country.countryCode);
          if (!palette) {
            palette = await flagPalette(country.countryCode);
            flagCache.current.set(country.countryCode, palette);
          }
          if (selectedColors.every((color) => palette.has(color))) matches.push(country);
        } catch {}
        checked += 1;
        if (!cancelled && checked % 20 === 0) setFlagStatus(`Checking flags ${checked} / ${candidates.length}`);
      }
    };
    Promise.all(Array.from({ length: Math.min(10, candidates.length) }, worker)).then(() => {
      if (cancelled) return;
      matches.sort((a, b) => a.name.localeCompare(b.name));
      setMatchingFlags(matches);
      setFlagStatus(matches.length ? `${matches.length} countries match all selected colors` : 'No flags match all selected colors');
    });
    return () => { cancelled = true; };
  }, [loadingPlaces, places, selectedColors]);

  // Three.js Scene Setup
  useEffect(() => {
    const THREE = window.THREE;
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!THREE || !canvas || !host) return undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.z = 3.2;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), new THREE.MeshStandardMaterial({ color: 0x9bc6ff, roughness: 0.9 }));
    earth.rotation.y = -0.55;
    scene.add(earth, new THREE.AmbientLight(0xffffff, 2.2));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(-3, 2, 4);
    scene.add(sun);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg', () => {
      texture.encoding = THREE.sRGBEncoding;
      earth.material.map = texture;
      earth.material.color.set(0xffffff);
      earth.material.needsUpdate = true;
    });
    const pin = new THREE.Group();
    pin.add(new THREE.Mesh(new THREE.SphereGeometry(0.055, 24, 16), new THREE.MeshBasicMaterial({ color: 0x1a73e8, transparent: true, opacity: 0.22 })));
    pin.add(new THREE.Mesh(new THREE.SphereGeometry(0.025, 24, 16), new THREE.MeshBasicMaterial({ color: 0xea4335 })));
    pin.visible = false;
    earth.add(pin);
    globeRef.current = earth;
    pinRef.current = pin;

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      renderer.setSize(Math.max(1, bounds.width), Math.max(1, bounds.height), false);
      camera.aspect = Math.max(1, bounds.width) / Math.max(1, bounds.height);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    setGlobeReady(true);
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastFrameTime = 0;
    let frame;
    const animate = (time) => {
      if (lastFrameTime && !dragging) earth.rotation.y += (time - lastFrameTime) * 0.00026;
      lastFrameTime = time;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    const startDrag = (event) => { if (event.target.closest('button, a, input, textarea, select')) return; dragging = true; lastX = event.clientX; lastY = event.clientY; host.setPointerCapture(event.pointerId); };
    const moveDrag = (event) => {
      if (!dragging) return;
      earth.rotation.y += (event.clientX - lastX) * 0.006;
      earth.rotation.x = Math.max(-0.8, Math.min(0.8, earth.rotation.x + (event.clientY - lastY) * 0.004));
      lastX = event.clientX; lastY = event.clientY;
    };
    const stopDrag = () => { dragging = false; };
    const zoom = (event) => { event.preventDefault(); camera.position.z = Math.max(2.2, Math.min(5.2, camera.position.z + event.deltaY * 0.002)); };
    host.addEventListener('pointerdown', startDrag);
    host.addEventListener('pointermove', moveDrag);
    host.addEventListener('pointerup', stopDrag);
    host.addEventListener('pointercancel', stopDrag);
    host.addEventListener('wheel', zoom, { passive: false });
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener('pointerdown', startDrag);
      host.removeEventListener('pointermove', moveDrag);
      host.removeEventListener('pointerup', stopDrag);
      host.removeEventListener('pointercancel', stopDrag);
      host.removeEventListener('wheel', zoom);
      texture.dispose(); earth.geometry.dispose(); earth.material.dispose();
      scene.traverse((object) => { if (object.isMesh && object !== earth) { object.geometry.dispose(); object.material.dispose(); } });
      renderer.dispose();
      globeRef.current = null; pinRef.current = null;
    };
  }, []);

  // Update Pin and 3D Flight Arc Route
  useEffect(() => {
    if (!globeRef.current || !pinRef.current || !window.THREE) return;
    const THREE = window.THREE;
    
    if (arcRef.current) {
      globeRef.current.remove(arcRef.current);
      arcRef.current.geometry.dispose();
      arcRef.current.material.dispose();
      arcRef.current = null;
    }

    if (!selected) {
      pinRef.current.visible = false;
      globeRef.current.rotation.set(0, -0.55, 0);
      return;
    }

    const lat1 = THREE.MathUtils.degToRad(selected.lat);
    const lon1 = THREE.MathUtils.degToRad(selected.lon);
    const r1 = Math.cos(lat1);
    const pos1 = new THREE.Vector3(r1 * Math.cos(lon1), Math.sin(lat1), -r1 * Math.sin(lon1)).multiplyScalar(1.018);
    
    pinRef.current.position.copy(pos1);
    pinRef.current.visible = true;
    globeRef.current.rotation.x = lat1;
    globeRef.current.rotation.y = -Math.PI / 2 - lon1;

    if (comparePlace) {
      const lat2 = THREE.MathUtils.degToRad(comparePlace.lat);
      const lon2 = THREE.MathUtils.degToRad(comparePlace.lon);
      const r2 = Math.cos(lat2);
      const pos2 = new THREE.Vector3(r2 * Math.cos(lon2), Math.sin(lat2), -r2 * Math.sin(lon2)).multiplyScalar(1.018);

      const midPos = pos1.clone().add(pos2).multiplyScalar(0.5);
      const distanceFactor = pos1.distanceTo(pos2);
      midPos.normalize().multiplyScalar(1.0 + distanceFactor * 0.3);

      const curve = new THREE.QuadraticBezierCurve3(pos1, midPos, pos2);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0xea4335, linewidth: 3 });
      const arcLine = new THREE.Line(geometry, material);
      
      globeRef.current.add(arcLine);
      arcRef.current = arcLine;
    }
  }, [selected, comparePlace, globeReady]);

  function selectPlace(place) {
    setSelected(place);
    setQuery(place.name);
    setActiveContinent(place.continent);
    const country = place.countryCode ? places.find((item) => item.type === 'Country' && item.countryCode === place.countryCode) : null;
    setSubdivisionCountry(place.type === 'Country' ? place : country);
    setShowingSubdivisions(place.type === 'State / province');
    setToast('');
  }

  function clearSelectedPlace() {
    setSelected(null);
    setComparePlace(null);
    setQuery('');
    setSubdivisionCountry(null);
    setShowingSubdivisions(false);
    setActiveHighlightFilter(null);
    setToast('');
  }

  function locateMe() {
    if (!navigator.geolocation) { setToast('Location is not available in this browser.'); return; }
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const nearby = places.find((place) => place.type === 'Country' && place.countryCode && Math.abs(place.lat - coords.latitude) < 8 && Math.abs(place.lon - coords.longitude) < 12);
      if (nearby) selectPlace({ ...nearby, lat: coords.latitude, lon: coords.longitude });
      else selectPlace({ name: 'My location', type: 'Coordinates', continent: 'Unknown', lat: coords.latitude, lon: coords.longitude });
    }, () => setToast('Allow location access to center the globe on you.'), { timeout: 10000 });
  }

  function selectFlagColor(color) {
    setSelectedColors((current) => current.includes(color) ? current.filter((item) => item !== color) : [...current, color]);
  }

  function handleHighlightClick(filterName) {
    setActiveHighlightFilter(filterName);
    setView('regions');
    setToast(`Filtered regions by ${filterName}`);
  }

  return (
    <section id="world-map" className="wl-map-section atlas-section" aria-label="World map atlas">
      <div className="atlas-toolbar">
        <div className="atlas-toolbar-title"><button className="atlas-back-mark" type="button" onClick={onBack} aria-label="Back to Discover">↖</button><strong>World map</strong></div>
        <div className="atlas-search-wrap">
          <label className="sr-only" htmlFor="atlas-search">Search a country, state, or continent</label>
            <input id="atlas-search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && suggestions[0]) { event.preventDefault(); selectPlace(suggestions[0]); } if (event.key === 'Escape') clearSelectedPlace(); }} placeholder="Search a country, state, or continent" aria-autocomplete="list" aria-controls="atlas-suggestions" aria-expanded={Boolean(suggestions.length)} />
            {query && <button className="atlas-search-clear" type="button" onMouseDown={(event) => event.preventDefault()} onClick={clearSelectedPlace} aria-label="Clear search and map selection" title="Clear search">×</button>}
          {suggestions.length > 0 && (
            <div id="atlas-suggestions" className="atlas-suggestions" role="listbox">
              {suggestions.map((place) => (
                <button key={`${place.type}-${place.name}`} type="button" role="option" onMouseDown={(event) => event.preventDefault()} onClick={() => selectPlace(place)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {place.countryCode && <img src={`https://flagcdn.com/w40/${place.countryCode.toLowerCase()}.png`} alt="" style={{ width: '19px', height: '13px', objectFit: 'cover' }} />}
                    <span>{place.name}<small>{place.country ? `${place.country} · ${place.continent}` : place.continent}</small></span>
                  </span>
                  <em>{place.type}</em>
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="atlas-locate" type="button" onClick={locateMe}>My location</button>
        <div className="atlas-tabs" role="group" aria-label="Map view"><button type="button" aria-pressed={view === 'explore'} onClick={() => setView('explore')}>Explore</button><button type="button" aria-pressed={view === 'regions'} onClick={() => setView('regions')}>Regions</button></div>
      </div>
      <div className="atlas-layout">
        <aside className="atlas-left">
          <section className="atlas-panel"><h2>Find by flag colors</h2><div className="atlas-color-grid">{flagColors.map(([name, color]) => <button key={name} type="button" aria-pressed={selectedColors.includes(name)} onClick={() => selectFlagColor(name)}><span style={{ '--swatch': color }} />{name}</button>)}</div><p className="atlas-status" role="status" aria-live="polite">{flagStatus}</p>{matchingFlags.length > 0 && <div className="atlas-country-list">{matchingFlags.slice(0, 12).map((place) => <button key={place.countryCode} type="button" onClick={() => selectPlace(place)}><img src={`https://flagcdn.com/w40/${place.countryCode.toLowerCase()}.png`} alt="" />{place.name}</button>)}</div>}</section>
          
          <section className="atlas-panel">
            <div className="atlas-panel-heading">
              <h2>Regions</h2>
              {view === 'regions' && <span>{regionPlaces.length} {showingSubdivisions ? 'states / provinces' : 'countries'}</span>}
            </div>
            <div className="atlas-region-grid">
              {continents.map((place) => (
                <button key={place.name} type="button" aria-pressed={activeContinent === place.name} onClick={() => { setActiveContinent(place.name); setSubdivisionCountry(null); setShowingSubdivisions(false); selectPlace({ ...place, type: 'Continent', continent: place.name }); }}>
                  {place.name}
                </button>
              ))}
            </div>
            {view === 'regions' && (
              <>
                {subdivisionCountry && (
                  <button className="atlas-subdivision-toggle" type="button" aria-pressed={showingSubdivisions} onClick={() => setShowingSubdivisions((value) => !value)}>
                    {showingSubdivisions ? 'Back to countries' : `Browse ${subdivisionCountry.name} states / provinces`}
                  </button>
                )}
                <div className="atlas-country-list">
                  {loadingPlaces ? <p>Loading countries…</p> : regionPlaces.length ? regionPlaces.map((place) => <button key={`${place.type}-${place.countryCode}-${place.name}`} type="button" onClick={() => selectPlace(place)}>{place.countryCode && <img src={`https://flagcdn.com/w40/${place.countryCode.toLowerCase()}.png`} alt="" />}{place.name}</button>) : <p>No state or province records are available.</p>}
                </div>
              </>
            )}
          </section>

          <section className="atlas-panel">
            <h2>Overview</h2>
            <div className="atlas-stats">
              <div style={{ cursor: 'pointer' }} onClick={() => { setView('explore'); clearSelectedPlace(); setToast('Showing all global destinations'); }}>
                <strong>{mapPlaces.length}</strong><span>destinations</span>
              </div>
              <div style={{ cursor: 'pointer' }} onClick={() => { setView('regions'); setToast('Switched to regional country explorer'); }}>
                <strong>{loadingPlaces ? '…' : places.filter((place) => place.type === 'Country').length}</strong><span>countries</span>
              </div>
              <div><strong>{collectedMapIds.length * 25}</strong><span>XP earned</span></div>
              <div><strong>{collectedMapIds.length}</strong><span>guides saved</span></div>
            </div>
          </section>
        </aside>

        <div className="atlas-globe-column">
          <div className="atlas-globe-frame">
            <div ref={hostRef} className="atlas-globe" aria-label="Interactive Earth globe. Drag to rotate and scroll to zoom.">
              <canvas ref={canvasRef} aria-hidden="true" />
              {!globeReady && <img className="atlas-globe-fallback" src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=900&q=85" alt="" />}
              {selected && (
                <div className="atlas-map-label">
                  <span className="atlas-map-pin" aria-hidden="true" />
                  <strong>{selected.name}</strong>
                  <small>{selected.country || selected.continent}</small>
                </div>
              )}
            </div>
          </div>
          {toast && <p className="atlas-toast" role="status">{toast}</p>}
        </div>

        <aside className="atlas-right">
          <section className="atlas-panel atlas-place-panel">
            <div className="atlas-panel-heading">
              <h2>{selected?.name || 'World'}</h2>
              <span>{selected?.type || 'All regions'}</span>
            </div>
            
            <dl>
              <div><dt>Continent</dt><dd>{selected?.continent || 'All'}</dd></div>
              <div><dt>Coordinates</dt><dd>{selected ? `${selected.lat.toFixed(2)}, ${selected.lon.toFixed(2)}` : 'Search a place'}</dd></div>
              
              <div>
                <dt>Local Time</dt>
                <dd style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{selected ? `${selectedLocalTime.timeStr} (${selectedLocalTime.isDay ? '☀️' : '🌙'})` : 'N/A'}</dd>
              </div>

              {comparePlace && (
                <>
                  <div>
                    <dt>Time Gap</dt>
                    <dd style={{ color: '#286d5e', fontWeight: 'bold' }}>{getTimeDiffString(selected, comparePlace)}</dd>
                  </div>
                  <div>
                    <dt>Flight Distance</dt>
                    <dd>{calculateDistance(selected.lat, selected.lon, comparePlace.lat, comparePlace.lon)} km</dd>
                  </div>
                </>
              )}

              {selected?.capital && selected.capital !== 'Unknown' && (
                <div>
                  <dt>Capital City</dt>
                  <dd style={{ color: '#1e6e80', fontWeight: 'bold' }}>{selected.capital}</dd>
                </div>
              )}

              <div>
                <dt>Languages</dt>
                <dd>
                  {selected?.languages && selected.languages.length > 0 ? (
                    <span style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end' }}>
                      {selected.languages.map((lang, idx) => (
                        <span key={idx} style={{ background: '#eef3f0', color: '#286d5e', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>
                          {lang}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span>{selected ? 'N/A' : 'Select a place'}</span>
                  )}
                </dd>
              </div>
            </dl>

            {/* Meeting Sync Widget */}
            {selected && (
              <div style={{ marginTop: '12px', padding: '10px', background: '#f4f8f6', borderRadius: '8px', border: '1px solid #d8e5df' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#286d5e' }}>Global Meeting Sync</span>
                  <span style={{ fontSize: '10px', background: '#e2ede7', padding: '2px 6px', borderRadius: '4px', color: '#1e5a4d' }}>{String(syncHour).padStart(2, '0')}:00 UTC</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="23" 
                  value={syncHour} 
                  onChange={(e) => setSyncHour(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#286d5e', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#52635c', marginTop: '6px' }}>
                  <span>{selected.name}: <strong>{selectedLocalTime.timeStr}</strong></span>
                  {comparePlace && <span>{comparePlace.name}: <strong>{compareLocalTime.timeStr}</strong></span>}
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            {selected && (
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                <button className="atlas-collect" type="button" style={{ flex: 1, margin: 0, background: comparePlace ? '#e7f1ec' : '#d6f263' }} onClick={() => setComparePlace(comparePlace ? null : selected)}>
                  {comparePlace ? 'Clear Comparison & Arc' : 'Compare & Draw Flight Arc'}
                </button>
              </div>
            )}

            {curatedPlace && (
              <button className="atlas-collect" type="button" style={{ marginTop: '8px' }} aria-pressed={collectedMapIds.includes(curatedPlace.id)} onClick={() => { onCollect(curatedPlace); setToast(collectedMapIds.includes(curatedPlace.id) ? `${curatedPlace.name} is already saved.` : `+25 XP · ${curatedPlace.name} guide saved`); }}>
                {collectedMapIds.includes(curatedPlace.id) ? 'Saved guide' : 'Collect guide · 25 XP'}
              </button>
            )}
          </section>

          {/* Quick Vibe & Culture Card matching Mockup */}
          {selected && (
            <div className="atlas-vibe-card" style={{ backgroundImage: `url(${wikiData.imageUrl})` }}>
              <div className="atlas-vibe-overlay" />
              <div className="atlas-vibe-content">
                <div className="atlas-vibe-header">
                  <span>✨ Quick vibe & culture</span>
                </div>
                <p className="atlas-vibe-text">
                  {loadingWiki ? 'Loading insights…' : wikiData.snippet.slice(0, 160) + '...'}
                </p>
                <div className="atlas-vibe-footer">
                  <div className="atlas-vibe-badge">
                    <span>🍲</span>
                    <div>
                      <small>Food</small>
                      <strong>Nyama Choma</strong>
                    </div>
                  </div>
                  <div className="atlas-vibe-badge">
                    <span>🎵</span>
                    <div>
                      <small>Music</small>
                      <strong>Benga</strong>
                    </div>
                  </div>
                  <div className="atlas-vibe-badge">
                    <span>🤝</span>
                    <div>
                      <small>People</small>
                      <strong>Warm & Proud</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <section className="atlas-panel" style={{ marginTop: '12px' }}>
            <h2>Highlights (Click to Filter)</h2>
            <div className="atlas-highlights">
              <div style={{ cursor: 'pointer', opacity: activeHighlightFilter === 'Urban design' ? 1 : 0.85 }} onClick={() => handleHighlightClick('Urban design')}>
                <span style={{ background: activeHighlightFilter === 'Urban design' ? '#286d5e' : '#4e9ab0' }} />
                Urban design
                <strong>{highlightShare(['design', 'interior'])}%</strong>
              </div>
              <div style={{ cursor: 'pointer', opacity: activeHighlightFilter === 'Food culture' ? 1 : 0.85 }} onClick={() => handleHighlightClick('Food culture')}>
                <span style={{ background: activeHighlightFilter === 'Food culture' ? '#286d5e' : '#4e9ab0' }} />
                Food culture
                <strong>{highlightShare(['cafe', 'food', 'coffee'])}%</strong>
              </div>
              <div style={{ cursor: 'pointer', opacity: activeHighlightFilter === 'Architectural tours' ? 1 : 0.85 }} onClick={() => handleHighlightClick('Architectural tours')}>
                <span style={{ background: activeHighlightFilter === 'Architectural tours' ? '#286d5e' : '#4e9ab0' }} />
                Architectural tours
                <strong>{highlightShare(['architecture', 'geometry'])}%</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}