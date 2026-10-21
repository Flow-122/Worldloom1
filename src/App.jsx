import { useEffect, useRef, useState } from 'react';
import AtlasMap from './AtlasMap.jsx';


const collections = [
  {
    id: 'cafe-kyoto',
    title: 'The slow cafe crawl',
    place: 'Kyoto, Japan',
    category: 'Places',
    note: 'Quiet counters in Kyoto, kissaten jazz, and a perfect second cup.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85',
    imageAlt: 'A cup of coffee on a warm wooden cafe table',
    color: 'matcha',
    minutes: '8 spots'
  },
  {
    id: 'color-stories',
    title: 'Color with a point of view',
    place: 'Copenhagen, Denmark',
    category: 'Design',
    note: 'Rooms and objects that know when to turn the volume up.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85',
    imageAlt: 'A considered living room with natural materials and sculptural furniture',
    color: 'citrus',
    minutes: '12 finds'
  },
  {
    id: 'third-places',
    title: 'Third places, first feelings',
    place: 'Seoul, South Korea',
    category: 'Ideas',
    note: 'Bookshops, listening bars, and all the places between home and work.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=85',
    imageAlt: 'A softly lit neighborhood restaurant with inviting tables',
    color: 'tomato',
    minutes: '6 ideas'
  },
  {
    id: 'island-light',
    title: 'Where the island light lands',
    place: 'Naoshima, Japan',
    category: 'Places',
    note: 'Art, salt air, and an itinerary with room to get lost.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85',
    imageAlt: 'A quiet coastal landscape beneath a bright open sky',
    color: 'sky',
    minutes: '5 stops'
  },
  {
    id: 'soft-geometry',
    title: 'Soft geometry club',
    place: 'Mexico City, Mexico',
    category: 'Design',
    note: 'Concrete curves, clean lines, and color that stays a little weird.',
    image: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1000&q=85',
    imageAlt: 'Sculptural modern architecture against a clear sky',
    color: 'citrus',
    minutes: '9 finds'
  },
  {
    id: 'night-markets',
    title: 'A very good night market',
    place: 'Taipei, Taiwan',
    category: 'Places',
    note: 'Follow the steam, stay for one more tiny plate.',
    image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1000&q=85',
    imageAlt: 'A lively night market filled with glowing signs and food stalls',
    color: 'tomato',
    minutes: '11 bites'
  },
  {
    id: 'creative-rituals',
    title: 'Make a ritual of it',
    place: 'Anywhere, honestly',
    category: 'Ideas',
    note: 'Small creative resets for the days that need a plot twist.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=85',
    imageAlt: 'A notebook and pen ready for a new idea',
    color: 'sky',
    minutes: '7 prompts'
  },
  {
    id: 'morning-walks',
    title: 'The long way to breakfast',
    place: 'Lisbon, Portugal',
    category: 'Places',
    note: 'A hill, a tiled wall, a bakery worth finding before 9.',
    image: 'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?auto=format&fit=crop&w=1000&q=85',
    imageAlt: 'A sunlit European street with colorful buildings',
    color: 'matcha',
    minutes: '4 walks'
  },
  {
    id: 'kenya-coast',
    title: 'A slower side of Kenya',
    place: 'Kenya',
    category: 'Places',
    note: 'A wild coastline, warm Swahili hospitality, and room to take the long way.',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1000&q=85',
    imageAlt: 'A sunlit savanna landscape in Kenya',
    color: 'matcha',
    minutes: '7 stops'
  },
  {
    id: 'objects-with-soul',
    title: 'Objects with a little soul',
    place: 'Milan, Italy',
    category: 'Design',
    note: 'Everyday pieces that make a room feel like your room.',
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85',
    imageAlt: 'A calm interior with carefully collected home objects',
    color: 'citrus',
    minutes: '10 finds'
  },
  {
    id: 'tiny-museums',
    title: 'Tiny museums, huge feelings',
    place: 'Amsterdam, Netherlands',
    category: 'Ideas',
    note: 'Pocket-sized culture for people who like the side door.',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1000&q=85',
    imageAlt: 'A bright painting hanging in an intimate gallery',
    color: 'tomato',
    minutes: '6 rooms'
  }
];

const collectionGalleryPhotos = {
  'cafe-kyoto': [
    { image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=85', alt: 'A warm neighborhood cafe interior' },
    { image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=85', alt: 'Cafe tables beside a bright window' }
  ],
  'color-stories': [
    { image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85', alt: 'A calm modern living room with sculptural furniture' },
    { image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85', alt: 'A light-filled contemporary interior' }
  ],
  'third-places': [
    { image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85', alt: 'A city skyline illuminated at dusk' },
    { image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=85', alt: 'A dense downtown skyline viewed from above' }
  ],
  'island-light': [
    { image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=85', alt: 'Waves rolling onto a quiet coast' },
    { image: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1200&q=85', alt: 'A winding road across an open landscape' }
  ],
  'soft-geometry': [
    { image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=85', alt: 'Contemporary architecture in clear daylight' },
    { image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85', alt: 'Sculptural architecture against the sky' }
  ],
  'night-markets': [
    { image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=85', alt: 'A steaming bowl served at a night market' },
    { image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85', alt: 'A colorful spread of local dishes' }
  ],
  'creative-rituals': [
    { image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=85', alt: 'A notebook open on a sunlit desk' },
    { image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=85', alt: 'A journal ready for new ideas' }
  ],
  'morning-walks': [
    { image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85', alt: 'A quiet landscape beneath open skies' },
    { image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=85', alt: 'A narrow canal-side street in Venice' }
  ],
  'kenya-coast': [
    { image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=85', alt: 'A wide savanna beneath a bright sky' },
    { image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=85', alt: 'Wildlife moving through open grassland' }
  ],
  'objects-with-soul': [
    { image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85', alt: 'Collected objects in a warm modern home' },
    { image: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1200&q=85', alt: 'Sculptural furniture and considered home details' }
  ],
  'tiny-museums': [
    { image: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?auto=format&fit=crop&w=1200&q=85', alt: 'Artwork displayed in a bright gallery' },
    { image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1200&q=85', alt: 'Framed contemporary art on a gallery wall' }
  ]
};

function getCollectionPhotos(collection) {
  return [{ image: collection.image, alt: collection.imageAlt }, ...(collectionGalleryPhotos[collection.id] || [])];
}

const topics = ['Design', 'Places', 'Ideas'];
const savedKey = 'worldloom-saved-collections';
const openedKey = 'worldloom-opened-collections';
const collectedMapKey = 'worldloom-collected-map-places';
const appPages = ['discover', 'collections', 'world-map', 'portfolio', 'saved'];
const mapPlaces = [
  { id: 'kenya', name: 'Kenya', collectionId: 'kenya-coast', lat: 0.02, lon: 37.9 },
  { id: 'japan', name: 'Japan', collectionId: 'island-light', lat: 36.2, lon: 138.25 },
  { id: 'portugal', name: 'Portugal', collectionId: 'morning-walks', lat: 39.4, lon: -8.2 },
  { id: 'mexico', name: 'Mexico', collectionId: 'soft-geometry', lat: 23.6, lon: -102.5 },
  { id: 'south-korea', name: 'South Korea', collectionId: 'third-places', lat: 36.5, lon: 127.9 }
];
const wallpaperPhotos = {
  design: [
    'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1800&q=85'
  ],
  places: [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1800&q=85'
  ],
  ideas: [
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=85'
  ]
};
const makeWallpaperSlide = (images, veil, collage = false) => ({
  image: `linear-gradient(${veil}),${images.map((image) => `url("${image}")`).join(',')}`,
  size: collage ? 'auto,58% 48%,42% 50%,42% 50%' : 'cover',
  position: collage ? 'center,left top,right top,right bottom' : 'center center'
});
const wallpaperSlides = {
  Design: wallpaperPhotos.design.map((image) => makeWallpaperSlide([image], 'rgba(239,170,146,.64),rgba(239,170,146,.76)')),
  Places: wallpaperPhotos.places.map((image) => makeWallpaperSlide([image], 'rgba(185,214,158,.62),rgba(185,214,158,.74)')),
  Ideas: wallpaperPhotos.ideas.map((image) => makeWallpaperSlide([image], 'rgba(239,212,92,.62),rgba(239,212,92,.76)')),
  All: [
    [wallpaperPhotos.design[0], wallpaperPhotos.places[0], wallpaperPhotos.ideas[0]],
    [wallpaperPhotos.design[1], wallpaperPhotos.ideas[1], wallpaperPhotos.places[1]],
    [wallpaperPhotos.design[2], wallpaperPhotos.places[2], wallpaperPhotos.ideas[2]]
  ].map((images) => makeWallpaperSlide(images, 'rgba(251,248,239,.68),rgba(251,248,239,.82)', true))
};

function readIds(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value)
      ? [...new Set(value.filter((id) => collections.some((item) => item.id === id)))]
      : [];
  } catch {
    return [];
  }
}

function writeIds(key, ids) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {}
}

function readCollectedMapIds() {
  try {
    const value = JSON.parse(localStorage.getItem(collectedMapKey));
    return Array.isArray(value) ? [...new Set(value.filter((id) => mapPlaces.some((place) => place.id === id)))] : [];
  } catch {
    return [];
  }
}

function readActivePage() {
  const page = window.location.hash.slice(1);
  return appPages.includes(page) ? page : 'discover';
}

export default function App() {
  const [query, setQuery] = useState('');
  const [guideResults, setGuideResults] = useState([]);
  const [guideStatus, setGuideStatus] = useState('');
  const guideCache = useRef(new Map());
  const [activeTopic, setActiveTopic] = useState('All');
  const [wallpaperIndex, setWallpaperIndex] = useState(0);
  const [collectionVisit, setCollectionVisit] = useState(0);
  const [activePage, setActivePage] = useState(readActivePage);
  const [savedIds, setSavedIds] = useState(readIds(savedKey));
  const [openedIds, setOpenedIds] = useState(readIds(openedKey));
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [heartBurst, setHeartBurst] = useState('');
  const [collectedMapIds, setCollectedMapIds] = useState(readCollectedMapIds);
  const [portfolioName, setPortfolioName] = useState('Avery Morgan');
  const [portfolioBio, setPortfolioBio] = useState('Collecting places, colors, and the small details that make a story.');
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [portfolioDragActive, setPortfolioDragActive] = useState(false);
  const [portfolioMessage, setPortfolioMessage] = useState('');
  const showSaved = activePage === 'saved';
  const progress = Math.min(openedIds.length, 10);
  const progressPercent = progress * 10;
  const topicWash = activeTopic === 'Design' ? '#efaa92' : activeTopic === 'Places' ? '#b9d69e' : activeTopic === 'Ideas' ? '#efd45c' : '#fbf8ef';
  const currentWallpaperSlides = wallpaperSlides[activeTopic] || wallpaperSlides.All;
  const currentWallpaper = currentWallpaperSlides[wallpaperIndex % currentWallpaperSlides.length];

  const search = query.trim().toLowerCase();
  const visibleCollections = collections.filter((collection) => {
    const matchesTopic = activeTopic === 'All' || collection.category === activeTopic;
    const searchableText = [collection.title, collection.place, collection.category, collection.note].join(' ').toLowerCase();
    const matchesSearch = !search || search.split(/\s+/).every((word) => {
      const normalizedWord = word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word;
      return searchableText.includes(normalizedWord);
    });
    return matchesTopic && matchesSearch && (!showSaved || savedIds.includes(collection.id));
  });
  const selectedPhotos = selectedCollection ? getCollectionPhotos(selectedCollection) : [];

  useEffect(() => {
    setWallpaperIndex(0);
  }, [activeTopic]);

  useEffect(() => {
    if (activePage !== 'collections' || currentWallpaperSlides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => setWallpaperIndex((current) => (current + 1) % currentWallpaperSlides.length), 7000);
    return () => window.clearInterval(timer);
  }, [activePage, activeTopic]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (activePage !== 'discover' || normalizedQuery.length < 2) {
      setGuideResults([]);
      setGuideStatus('');
      return undefined;
    }

    const cacheKey = normalizedQuery.toLocaleLowerCase();
    const cachedResults = guideCache.current.get(cacheKey);
    if (cachedResults) {
      setGuideResults(cachedResults);
      setGuideStatus(cachedResults.length ? `${cachedResults.length} more ideas from Wikipedia` : 'No illustrated Wikipedia results for this search.');
      return undefined;
    }

    const controller = new AbortController();
    setGuideResults([]);
    setGuideStatus('Searching beyond your collections…');
    const timeoutId = window.setTimeout(async () => {
      const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: normalizedQuery,
        gsrnamespace: '0',
        gsrlimit: '6',
        prop: 'pageimages|extracts|info',
        inprop: 'url',
        exintro: '1',
        explaintext: '1',
        exsentences: '2',
        piprop: 'thumbnail',
        pithumbsize: '480',
        format: 'json',
        origin: '*'
      });

      try {
        const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Guide search is unavailable');
        const data = await response.json();
        const results = Object.values(data.query?.pages || {})
          .sort((first, second) => first.index - second.index)
          .filter((page) => page.extract && page.thumbnail?.source)
          .map((page) => ({
            title: page.title,
            extract: page.extract,
            image: page.thumbnail.source,
            url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ', '_'))}`
          }));
        guideCache.current.set(cacheKey, results);
        setGuideResults(results);
        setGuideStatus(results.length ? `${results.length} more ideas from Wikipedia` : 'No illustrated Wikipedia results for this search.');
      } catch (error) {
        if (error.name === 'AbortError') return;
        setGuideStatus('Outside search is unavailable right now. Try Google instead.');
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [activePage, query]);
  useEffect(() => {
    const tailwindScript = document.querySelector('[data-worldloom-tailwind]');
    if (!tailwindScript) {
      const script = document.createElement('script');
      script.src = 'https://cdn.tailwindcss.com';
      script.dataset.worldloomTailwind = 'true';
      document.head.append(script);
    }

    if (!document.querySelector('[data-worldloom-fonts]')) {
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.dataset.worldloomFonts = 'true';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap';
      document.head.append(fontLink);
    }

    document.title = 'Worldloom — Find your next thing';
  }, []);

  useEffect(() => {
    const syncPage = () => setActivePage(readActivePage());
    window.addEventListener('popstate', syncPage);
    window.addEventListener('hashchange', syncPage);
    return () => {
      window.removeEventListener('popstate', syncPage);
      window.removeEventListener('hashchange', syncPage);
    };
  }, []);

  useEffect(() => {
    writeIds(savedKey, savedIds);
  }, [savedIds]);

  useEffect(() => {
    writeIds(openedKey, openedIds);
  }, [openedIds]);

  useEffect(() => {
    writeIds(collectedMapKey, collectedMapIds);
  }, [collectedMapIds]);

  useEffect(() => {
    if (!selectedCollection) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.querySelector('[aria-label="Close collection"]')?.focus();

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedCollection(null);
        return;
      }

      if (event.key !== 'Tab') return;
      const dialog = document.querySelector('[role="dialog"]');
      const focusable = dialog?.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [selectedCollection]);

  useEffect(() => {
    if (!heartBurst) return undefined;
    const timer = window.setTimeout(() => setHeartBurst(''), 420);
    return () => window.clearTimeout(timer);
  }, [heartBurst]);

  function navigateTo(page, resetFilters = false) {
    if (page === 'collections') setCollectionVisit((current) => current + 1);
    if (resetFilters) {
      setQuery('');
      setActiveTopic('All');
    }
    const nextHash = `#${page}`;
    if (window.location.hash !== nextHash) window.history.pushState(null, '', nextHash);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function stepWallpaper(direction) {
    setWallpaperIndex((current) => (current + direction + currentWallpaperSlides.length) % currentWallpaperSlides.length);
  }

  function openCollection(collection) {
    setGalleryIndex(0);
    setSelectedCollection(collection);
    setOpenedIds((current) => current.includes(collection.id) || current.length >= 10
      ? current
      : [...current, collection.id]);
  }

  function stepCollectionPhoto(direction) {
    setGalleryIndex((current) => (current + direction + selectedPhotos.length) % selectedPhotos.length);
  }

  function toggleSaved(collectionId) {
    setSavedIds((current) => current.includes(collectionId)
      ? current.filter((id) => id !== collectionId)
      : [...current, collectionId]);
    setHeartBurst(collectionId);
  }

  function collectMapPlace(place) {
    const isNew = !collectedMapIds.includes(place.id);
    setSavedIds((current) => current.includes(place.collectionId) ? current : [...current, place.collectionId]);
    if (isNew) setCollectedMapIds((current) => [...current, place.id]);
  }

  function addPortfolioFiles(fileList) {
    const imageFiles = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) {
      setPortfolioMessage('Choose image files to feature in your portfolio.');
      return;
    }

    setPortfolioFiles((current) => [...current, ...imageFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      preview: URL.createObjectURL(file)
    }))]);
    setPortfolioMessage(`${imageFiles.length} ${imageFiles.length === 1 ? 'image' : 'images'} added to your portfolio.`);
  }

  function removePortfolioFile(fileId) {
    const file = portfolioFiles.find((item) => item.id === fileId);
    if (file) URL.revokeObjectURL(file.preview);
    setPortfolioFiles((current) => current.filter((item) => item.id !== fileId));
  }

  return (
    <main className={`app-root app-page-${activePage} min-h-screen overflow-hidden bg-[#fbf8ef] text-[#20251f] selection:bg-[#f8bba7] selection:text-[#20251f]`} style={{ '--page-wash': topicWash }}>
      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; padding: 0; display: block; min-height: 100vh; font-family: 'DM Sans', sans-serif; background: #fbf8ef; }
        button, input { font: inherit; }
        button { cursor: pointer; }
        .display-font { font-family: 'Space Grotesk', sans-serif; }
        .app-root { width: 100%; max-width: none; min-height: 100vh; margin: 0 auto; overflow: hidden; background: #fbf8ef; color: #20251f; }
        .app-root.app-page-collections { position: relative; isolation: isolate; background-color: transparent; background-image: none; transition: background-color .45s ease; }
        .app-root.app-page-collections > .wl-header { background: rgba(251,248,239,.94); backdrop-filter: blur(12px); }
        .wl-wallpaper-layer { position: fixed; z-index: -1; inset: 0; background-color: var(--page-wash); background-image: var(--wallpaper-image); background-size: var(--wallpaper-size); background-position: var(--wallpaper-position); background-repeat: no-repeat; background-attachment: fixed; animation: wallpaper-reveal .9s ease-out both; pointer-events: none; }
        .wl-wallpaper-watermark { position: fixed; z-index: -1; inset: 0; background-image: var(--watermark-image); background-position: center; background-size: cover; background-repeat: no-repeat; opacity: .08; mix-blend-mode: multiply; pointer-events: none; }
        .app-root .wl-hero, .app-root .wl-topics, .app-root .wl-discover-picks, .app-root .wl-map-section, .app-root .wl-portfolio-section, .app-root .wl-collections { display: none; }
        .app-root.app-page-discover .wl-hero { display: grid; }
        .app-root.app-page-discover .wl-topics, .app-root.app-page-discover .wl-discover-picks, .app-root.app-page-collections .wl-topics, .app-root.app-page-world-map .wl-map-section, .app-root.app-page-portfolio .wl-portfolio-section, .app-root.app-page-collections .wl-collections, .app-root.app-page-saved .wl-collections { display: block; }
        .wl-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 18px; padding: 24px 5%; border-bottom: 1px solid #e7e1d2; }
        .wl-brand { display: inline-flex; align-items: center; gap: 12px; color: inherit; text-decoration: none; }
        .wl-brand-mark { display: grid; width: 40px; height: 40px; place-items: center; transform: rotate(-6deg); border: 2px solid #20251f; border-radius: 10px; background: #d6f263; box-shadow: 3px 3px 0 #20251f; font-size: 20px; font-weight: 900; }
        .wl-brand-name { font-size: 21px; font-weight: 800; letter-spacing: -.04em; }
        .wl-nav { display: flex; align-items: center; gap: 28px; }
        .wl-nav a { color: #75776f; font-size: 13px; font-weight: 700; text-decoration: none; }
        .wl-nav a.is-active { color: #20251f; text-decoration: underline; text-decoration-color: #ec7049; text-decoration-thickness: 3px; text-underline-offset: 8px; }
        .wl-nav a:hover { color: #20251f; }
        .wl-nav .saved-count { margin-left: 4px; border-radius: 99px; background: #20251f; padding: 2px 7px; color: white; font-size: 10px; }
        .wl-header-actions { display: flex; align-items: center; gap: 10px; }
        .wl-open-count { border: 1px solid #dedbcc; border-radius: 99px; padding: 9px 12px; font-size: 11px; font-weight: 700; }
        .wl-surprise { border: 0; border-radius: 99px; background: #20251f; padding: 11px 16px; color: white; font-size: 11px; font-weight: 800; transition: transform .2s, background .2s; }
        .wl-surprise:hover { transform: translateY(-2px); background: #394538; }
        .wl-hero { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 300px; grid-template-areas: 'copy progress'; align-items: end; gap: 44px; padding: 48px 5% 42px; direction: ltr; }
        .wl-hero-copy { position: relative; z-index: 1; width: 100%; max-width: 800px; grid-area: copy; }
        .wl-hero > .wl-progress-card { grid-area: progress; }
        .wl-sticker { display: inline-flex; align-items: center; gap: 8px; transform: rotate(-2deg); border-radius: 4px; background: #ec7049; padding: 9px 12px; box-shadow: 3px 3px 0 #20251f; color: white; font-size: 10px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
        .wl-hero-title { max-width: 780px; margin: 24px 0 0; font-family: 'Space Grotesk', sans-serif; font-size: 76px; font-weight: 700; line-height: .9; letter-spacing: -.07em; }
        .wl-highlight { position: relative; z-index: 0; white-space: nowrap; }
        .wl-highlight::after { position: absolute; z-index: -1; right: 0; bottom: 2px; left: 0; height: 15px; transform: rotate(-2deg); background: #d6f263; content: ''; }
        .wl-hero-copy > p { max-width: 520px; margin: 22px 0 0; color: #66695f; font-size: 17px; line-height: 1.65; }
        .wl-search { display: flex; max-width: 760px; align-items: center; gap: 10px; margin-top: 30px; border: 2px solid #20251f; border-radius: 18px; background: white; padding: 8px; box-shadow: 0 6px 0 #20251f; transition: transform .25s, box-shadow .25s; }
        .wl-search:focus-within { animation: search-pop .36s cubic-bezier(.2,.8,.25,1); transform: translateY(-4px); box-shadow: 0 10px 0 #20251f; }
        .wl-search-icon { display: grid; width: 48px; height: 48px; flex: none; place-items: center; border-radius: 11px; background: #f2efdf; font-size: 24px; }
        .wl-search-input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; padding: 0 4px; color: #20251f; font-size: 15px; font-weight: 600; }
        .wl-search-input::placeholder { color: #96978f; }
        .wl-search-submit { flex: none; border: 0; border-radius: 11px; background: #d6f263; padding: 14px 19px; font-size: 12px; font-weight: 900; transition: background .2s, transform .2s; }
        .wl-search-submit:hover { transform: translateY(-2px); background: #c7e84c; }
        .wl-search-submit.mobile { display: none; }
        .wl-discover-search-results { max-width: 760px; margin-top: 18px; border: 1px solid #dedbcc; border-radius: 8px; background: rgba(255,255,255,.9); padding: 14px 16px; box-shadow: 0 8px 22px rgba(32,37,31,.07); animation: fade-in .18s ease-out both; }
        .wl-discover-search-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 10px; }
        .wl-discover-search-title { display: grid; gap: 3px; color: #7a7e72; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .wl-discover-search-title strong { color: #263a34; font-size: 12px; text-transform: none; }
        .wl-discover-search-actions { display: flex; flex-wrap: wrap; gap: 8px; }
        .wl-discover-search-actions a, .wl-discover-search-actions button { border: 1px solid #d9e2de; border-radius: 5px; background: #fff; padding: 7px 10px; color: #43574d; font-size: 10px; font-weight: 800; text-decoration: none; }
        .wl-discover-search-actions a:hover, .wl-discover-search-actions button:hover { border-color: #aabcb2; background: #f3f7f4; }
        .wl-discover-search-row { display: grid; width: 100%; grid-template-columns: 44px minmax(0,1fr) auto; align-items: center; gap: 11px; border: 0; border-top: 1px solid #ece8dd; background: transparent; padding: 9px 0; color: #263a34; text-align: left; }
        .wl-discover-search-row img { width: 44px; height: 40px; border-radius: 4px; object-fit: cover; }
        .wl-discover-search-row span { min-width: 0; }
        .wl-discover-search-row strong, .wl-discover-search-row small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .wl-discover-search-row strong { font-size: 12px; }
        .wl-discover-search-row small { margin-top: 3px; color: #7a8177; font-size: 10px; }
        .wl-discover-search-row em { color: #687a6d; font-size: 10px; font-style: normal; }
        .wl-discover-search-empty { margin: 0; border-top: 1px solid #ece8dd; padding: 12px 0 3px; color: #73796f; font-size: 11px; }
        .wl-discover-guide-list { display: grid; }
        .wl-discover-guide { display: grid; grid-template-columns: 88px minmax(0,1fr) auto; align-items: center; gap: 12px; border-top: 1px solid #ece8dd; padding: 12px 0; color: #263a34; text-decoration: none; }
        .wl-discover-guide:hover strong { color: #527044; }
        .wl-discover-guide img { width: 88px; height: 66px; border-radius: 4px; background: #edf1ec; object-fit: cover; }
        .wl-discover-guide-copy { min-width: 0; }
        .wl-discover-guide-copy strong { display: block; font-size: 12px; }
        .wl-discover-guide-copy small { display: block; margin-top: 3px; color: #7a8177; font-size: 9px; }
        .wl-discover-guide-copy p { display: -webkit-box; overflow: hidden; margin: 5px 0 0; color: #73796f; font-size: 10px; line-height: 1.45; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
        .wl-discover-guide-arrow { color: #687a6d; font-size: 12px; }
        .wl-progress-card { border: 2px solid #20251f; border-radius: 8px; background: #fffdf7; padding: 20px; box-shadow: 5px 5px 0 #20251f; }
        .wl-progress-head, .wl-progress-label { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .wl-eyebrow { margin: 0; color: #797b72; font-size: 10px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
        .wl-progress-title { margin: 5px 0 0; font-family: 'Space Grotesk', sans-serif; font-size: 19px; font-weight: 700; }
        .wl-progress-count { flex: none; transform: rotate(-6deg); border-radius: 5px; background: #d6f263; padding: 7px 10px; font-size: 12px; font-weight: 900; }
        .wl-progress-label { margin-top: 22px; color: #5f655b; font-size: 11px; font-weight: 700; }
        .wl-progress-track { height: 12px; overflow: hidden; margin-top: 8px; border: 1px solid #20251f; border-radius: 99px; background: #edeadd; }
        .progress-fill { height: 100%; border-radius: inherit; background: #ec7049; transition: width .55s cubic-bezier(.2,.8,.25,1); }
        .wl-progress-note { margin: 10px 0 0; color: #85867c; font-size: 10px; }
        .wl-topics { border-top: 1px solid #e7e1d2; border-bottom: 1px solid #e7e1d2; background-color: #f4f0e4; background-image: radial-gradient(rgba(32,37,31,.13) .8px, transparent .8px); background-size: 16px 16px; padding: 22px 5%; }
        .wl-topic-inner { display: flex; max-width: 1300px; flex-wrap: wrap; align-items: center; gap: 13px; margin: 0 auto; }
        .wl-topic-caption { margin-right: 5px; color: #78796f; font-size: 10px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
        .topic-pill { border: 2px solid #20251f; border-radius: 99px; padding: 10px 18px; box-shadow: 3px 3px 0 #20251f; color: #20251f; font-size: 13px; font-weight: 900; transition: transform .22s cubic-bezier(.2,.8,.25,1), box-shadow .22s ease, background-color .2s ease; }
        .topic-pill[data-color='lime'] { background: #d6f263; }
        .topic-pill[data-color='coral'] { background: #f8bba7; }
        .topic-pill[data-color='white'] { background: white; }
        .topic-pill[data-color='dark'] { background: #20251f; color: white; }
        .topic-pill[data-color='sand'] { background: #e4dfd2; }
        .topic-pill:hover { transform: translateY(-5px) rotate(-2deg) scale(1.05); box-shadow: 0 9px 0 #20251f; }
        .topic-pill:active { transform: translateY(1px) scale(.97); box-shadow: 0 2px 0 #20251f; }
        .topic-pill[aria-pressed='true'] { position: relative; z-index: 1; border-color: #20251f; box-shadow: 0 0 0 2px #20251f, 5px 6px 0 #20251f; transform: translateY(-3px) rotate(-1.5deg) scale(1.06); }
        .wl-topic-count { margin-left: auto; color: #77796f; font-size: 11px; font-weight: 700; }
        .wl-discover-picks { border-bottom: 1px solid #e7e1d2; background: #fbf8ef; padding: 30px 5% 54px; }
        .wl-discover-picks-inner { max-width: 1300px; margin: 0 auto; }
        .wl-discover-picks-head { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 18px; }
        .wl-discover-picks-title { margin: 5px 0 0; font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; }
        .wl-picks-browse { border: 0; border-bottom: 2px solid #ec7049; background: transparent; padding: 6px 0; color: #394538; font-size: 11px; font-weight: 800; }
        .wl-path-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
        .wl-path-card { position: relative; overflow: hidden; border: 2px solid #20251f; border-radius: 8px; background: white; box-shadow: 4px 4px 0 #20251f; animation: card-in .5s cubic-bezier(.2,.75,.25,1) both; transition: transform .2s ease, box-shadow .2s ease; }
        .wl-path-card:nth-child(2) { animation-delay: .07s; }
        .wl-path-card:nth-child(3) { animation-delay: .14s; }
        .wl-path-card:hover { transform: translateY(-4px) rotate(-.4deg); box-shadow: 6px 8px 0 #20251f; }
        .wl-path-button { display: block; width: 100%; border: 0; background: transparent; padding: 0; color: #20251f; text-align: left; }
        .wl-path-photo { position: relative; display: block; overflow: hidden; aspect-ratio: 2.15; background: #e4dfd2; }
        .wl-path-photo img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .45s ease; }
        .wl-path-card:hover .wl-path-photo img { transform: scale(1.05); }
        .wl-path-number { position: absolute; right: 10px; bottom: 10px; display: grid; width: 30px; height: 30px; place-items: center; transform: rotate(5deg); border: 1px solid #20251f; border-radius: 5px; background: #d6f263; box-shadow: 2px 2px 0 #20251f; font-size: 10px; font-weight: 900; }
        .wl-path-copy { display: grid; gap: 5px; padding: 12px 14px 14px; }
        .wl-path-meta { color: #7b7d71; font-size: 9px; font-weight: 800; text-transform: uppercase; }
        .wl-path-copy strong { font-family: 'Space Grotesk', sans-serif; font-size: 16px; line-height: 1.15; }
        .wl-path-place { color: #72766b; font-size: 10px; }
        @media (max-width: 680px) { .wl-discover-picks { padding: 26px 20px 38px; } .wl-discover-picks-head { align-items: start; } .wl-path-grid { grid-template-columns: 1fr; gap: 14px; } .wl-path-photo { aspect-ratio: 2.5; } .wl-path-card:nth-child(3) { display: none; } }
        .app-root.app-page-world-map { display: flex; height: 100vh; min-height: 100vh; flex-direction: column; }
        .app-root.app-page-world-map > .wl-header { width: 100%; max-width: none; flex: none; }
        .app-root.app-page-world-map .wl-map-section { display: flex; height: calc(100vh - 90px); min-height: 0; flex: 1; align-items: stretch; padding: clamp(24px, 3vw, 48px); background: #e8f1e8; border: 0; }
        .app-root.app-page-world-map .wl-footer { display: none; }
        .app-root.app-page-world-map .wl-map-layout { display: grid; width: 100%; max-width: none; flex: 1; grid-template-columns: minmax(270px, .34fr) minmax(0, .66fr); align-items: stretch; gap: clamp(24px, 4vw, 72px); margin: 0 auto; }
        .wl-map-copy { width: 100%; max-width: 460px; align-self: center; }
        .wl-map-title { margin: 12px 0 0; font-family: 'Space Grotesk', sans-serif; font-size: 42px; font-weight: 700; line-height: 1; }
        .wl-map-description { margin: 16px 0 0; color: #606a5f; font-size: 14px; line-height: 1.7; }
        .wl-map-search-label { display: block; margin-top: 22px; color: #454e43; font-size: 10px; font-weight: 900; }
        .wl-map-search { width: 100%; margin-top: 7px; border: 2px solid #20251f; border-radius: 8px; outline: none; background: #fffdf7; padding: 12px 14px; box-shadow: 3px 3px 0 #20251f; color: #20251f; font-size: 13px; }
        .wl-map-search:focus-visible { outline: 3px solid #ec7049; outline-offset: 3px; }
        .wl-map-search-status { min-height: 16px; margin: 10px 0 0; color: #656f62; font-size: 10px; font-weight: 700; }
        .wl-map-xp { display: inline-flex; align-items: center; gap: 8px; margin-top: 25px; border: 1px solid #20251f; border-radius: 4px; background: #d6f263; padding: 9px 12px; font-size: 11px; font-weight: 900; }
        .wl-globe-stage { position: relative; display: grid; min-height: 0; height: 100%; place-items: center; perspective: 1000px; }
        .wl-globe { position: relative; width: min(100%, calc(100vh - 160px), 900px); aspect-ratio: 1; overflow: hidden; border-radius: 50%; background: transparent; }
        .wl-globe-image { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; animation: globe-image-spin 24s linear infinite; }
        .wl-map-pin { position: absolute; z-index: 1; display: grid; justify-items: center; gap: 4px; transform: translate(-50%, -50%); border: 0; background: transparent; padding: 0; color: white; text-shadow: 0 1px 4px rgba(0,0,0,.8); }
        .wl-map-pin:nth-of-type(2) .wl-map-pin-dot { animation-delay: -.4s; }
        .wl-map-pin:nth-of-type(3) .wl-map-pin-dot { animation-delay: -.8s; }
        .wl-map-pin:nth-of-type(4) .wl-map-pin-dot { animation-delay: -1.2s; }
        .wl-map-pin:nth-of-type(5) .wl-map-pin-dot { animation-delay: -.6s; }
        .wl-map-pin:nth-of-type(6) .wl-map-pin-dot { animation-delay: -1s; }
        .wl-map-pin-dot { display: grid; width: 30px; height: 30px; place-items: center; border: 2px solid #20251f; border-radius: 50%; background: #d6f263; box-shadow: 2px 3px 0 #20251f; color: #20251f; font-size: 12px; text-shadow: none; transition: transform .2s, background .2s; animation: pin-bounce 1.8s ease-in-out infinite; }
        .wl-map-pin:hover .wl-map-pin-dot, .wl-map-pin:focus-visible .wl-map-pin-dot { transform: scale(1.2); background: #f8bba7; }
        .wl-map-pin[aria-pressed='true'] .wl-map-pin-dot { background: #ec7049; color: white; }
        .wl-map-pin-label { border-radius: 3px; background: rgba(24,34,31,.78); padding: 3px 6px; font-size: 9px; font-weight: 900; white-space: nowrap; }
        .wl-map-toast { position: absolute; z-index: 3; right: 50%; bottom: 8px; width: max-content; max-width: calc(100% - 20px); transform: translateX(50%); border: 2px solid #20251f; border-radius: 6px; background: #fffdf7; padding: 12px 16px; box-shadow: 4px 4px 0 #20251f; color: #20251f; font-size: 13px; font-weight: 900; text-align: center; animation: fade-in .18s ease-out both; }
        @keyframes globe-image-spin { from { transform: scale(1.65) rotate(0deg); } to { transform: scale(1.65) rotate(360deg); } }
        @keyframes pin-bounce { 0%, 100% { translate: 0 0; } 50% { translate: 0 -8px; } }
        .wl-portfolio-section { padding: 68px 5%; border-top: 1px solid #e8d7c4; background: #f6e9d9; }
        .wl-portfolio-inner { max-width: 1300px; margin: 0 auto; }
        .wl-portfolio-heading { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, .72fr); align-items: center; gap: 32px; margin-bottom: 36px; }
        .wl-portfolio-title { max-width: 650px; margin: 10px 0 0; font-family: 'Space Grotesk', sans-serif; font-size: 46px; font-weight: 700; line-height: 1.02; }
        .wl-portfolio-intro { max-width: 550px; margin: 14px 0 0; color: #6f675d; font-size: 14px; line-height: 1.7; }
        .wl-profile-card { border: 3px solid #20251f; border-radius: 10px; background: #fff9ef; padding: 20px; box-shadow: 6px 6px 0 #20251f, inset 0 2px 0 rgba(255,255,255,.9); }
        .wl-profile-person { display: flex; align-items: center; gap: 14px; }
        .wl-profile-avatar { display: grid; width: 56px; height: 56px; flex: none; place-items: center; border: 2px solid #20251f; border-radius: 18px; background: #f8bba7; box-shadow: 3px 3px 0 #20251f; font-family: 'Space Grotesk', sans-serif; font-size: 19px; font-weight: 700; }
        .wl-profile-name { width: 100%; min-width: 0; border: 0; border-bottom: 2px solid #d7c7b3; outline: 0; background: transparent; padding: 3px 0 6px; color: #20251f; font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 700; }
        .wl-profile-bio { width: 100%; min-height: 54px; margin-top: 6px; resize: vertical; border: 0; outline: 0; background: transparent; color: #6f675d; font-size: 11px; line-height: 1.5; }
        .wl-profile-progress-head { display: flex; justify-content: space-between; gap: 12px; margin-top: 20px; font-size: 10px; font-weight: 900; }
        .wl-profile-progress { height: 15px; overflow: hidden; margin-top: 8px; border: 2px solid #20251f; border-radius: 99px; background: #eadcc9; box-shadow: inset 0 2px 3px rgba(32,37,31,.12); }
        .wl-profile-progress-fill { width: 78%; height: 100%; border-right: 2px solid #20251f; border-radius: inherit; background: #c9df84; box-shadow: inset 0 2px 0 rgba(255,255,255,.6); }
        .wl-portfolio-workspace { display: grid; grid-template-columns: minmax(280px, .78fr) minmax(0, 1.22fr); align-items: start; gap: 26px; }
        .wl-upload-zone { position: relative; display: grid; min-height: 300px; align-content: center; justify-items: center; gap: 10px; border: 3px dashed #20251f; border-radius: 10px; background: #dcebe0; padding: 28px; box-shadow: 6px 6px 0 #20251f, inset 0 2px 0 rgba(255,255,255,.75); text-align: center; transition: transform .2s, background .2s, box-shadow .2s; cursor: pointer; }
        .wl-upload-zone:hover, .wl-upload-zone.is-dragging { transform: translateY(-3px); background: #d1e5d6; box-shadow: 6px 9px 0 #20251f, inset 0 2px 0 rgba(255,255,255,.75); }
        .wl-upload-zone:focus-within { outline: 3px solid #ec7049; outline-offset: 4px; }
        .wl-upload-input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; clip-path: inset(50%); }
        .wl-upload-cloud { display: grid; width: 66px; height: 66px; place-items: center; border: 3px solid #20251f; border-radius: 22px; background: #fff9ef; box-shadow: 4px 4px 0 #20251f; font-size: 30px; }
        .wl-upload-title { margin: 5px 0 0; font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; }
        .wl-upload-hint { margin: 0; color: #5f6d61; font-size: 11px; line-height: 1.5; }
        .wl-upload-browse { display: inline-flex; align-items: center; min-height: 40px; margin-top: 5px; border: 3px solid #20251f; border-radius: 8px; background: #f8bba7; padding: 0 14px; box-shadow: 3px 3px 0 #20251f; font-size: 11px; font-weight: 900; }
        .wl-upload-zone:hover .wl-upload-browse { transform: translateY(-1px); box-shadow: 3px 4px 0 #20251f; }
        .wl-portfolio-projects { min-width: 0; }
        .wl-projects-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
        .wl-projects-title { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; }
        .wl-projects-count { color: #746b60; font-size: 10px; font-weight: 800; }
        .wl-project-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        .wl-project-item { position: relative; overflow: hidden; border: 3px solid #20251f; border-radius: 8px; background: #fff9ef; box-shadow: 5px 5px 0 #20251f; }
        .wl-project-image { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
        .wl-project-caption { overflow: hidden; padding: 10px 12px; color: #4b5148; font-size: 10px; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
        .wl-project-remove { position: absolute; top: 8px; right: 8px; display: grid; width: 34px; height: 34px; place-items: center; border: 2px solid #20251f; border-radius: 9px; background: #fff9ef; box-shadow: 2px 2px 0 #20251f; font-size: 19px; font-weight: 700; }
        .wl-project-empty { display: grid; min-height: 250px; place-items: center; border: 2px dashed #c8b8a3; border-radius: 8px; color: #776c5f; font-size: 12px; text-align: center; }
        .wl-portfolio-status { min-height: 18px; margin: 10px 0 0; color: #465c4b; font-size: 10px; font-weight: 700; }
        .wl-collections { padding: 54px 5% 82px; background: transparent; }
        .wl-collection-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 26px; }
        .wl-collection-tools { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 14px; }
        .wl-wallpaper-controls { display: inline-flex; align-items: center; gap: 7px; border: 1px solid rgba(32,37,31,.38); border-radius: 7px; background: rgba(255,253,247,.78); padding: 4px; backdrop-filter: blur(5px); }
        .wl-wallpaper-controls button { display: grid; width: 30px; height: 30px; place-items: center; border: 1px solid transparent; border-radius: 4px; background: transparent; color: #20251f; font-size: 18px; line-height: 1; }
        .wl-wallpaper-controls button:hover { border-color: #20251f; background: #d6f263; }
        .wl-section-title { margin: 10px 0 0; font-family: 'Space Grotesk', sans-serif; font-size: 34px; font-weight: 700; letter-spacing: -.04em; }
        .wl-result-count { flex: none; margin: 0 0 5px; color: #7d7e74; font-size: 11px; font-weight: 700; }
        .wl-card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
        .wl-card { position: relative; overflow: hidden; border: 2px solid #20251f; border-radius: 8px; background: white; box-shadow: 4px 4px 0 #20251f; animation: collection-card-pop .72s cubic-bezier(.2,.85,.25,1); transition: transform .2s, box-shadow .2s; }
        .wl-card:nth-child(2n) { animation-delay: .1s; }
        .wl-card:nth-child(3n) { animation-delay: .2s; }
        .wl-card:hover { transform: translateY(-4px); box-shadow: 6px 8px 0 #20251f; }
        .wl-card-photo { position: relative; display: block; width: 100%; aspect-ratio: 4 / 3; overflow: hidden; border: 0; background: #ece8dd; padding: 0; text-align: left; }
        .wl-card-photo img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s; }
        .wl-card:hover .wl-card-photo img { transform: scale(1.06); }
        .wl-category { position: absolute; top: 12px; left: 12px; border: 1px solid #20251f; border-radius: 99px; background: #fffdf7; padding: 6px 10px; font-size: 9px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
        .wl-opened { position: absolute; bottom: 12px; left: 12px; border-radius: 99px; background: #d6f263; padding: 6px 10px; font-size: 10px; font-weight: 900; }
        .heart-button { position: absolute; top: 11px; right: 11px; display: grid; width: 40px; height: 40px; place-items: center; border: 2px solid #20251f; border-radius: 50%; background: white; box-shadow: 2px 2px 0 #20251f; color: #20251f; font-size: 22px; transition: transform .2s ease, background-color .2s ease, color .2s ease; }
        .heart-button:hover { transform: rotate(-10deg) scale(1.12); }
        .heart-button.is-saved { animation: heart-pop .42s cubic-bezier(.2,.8,.25,1); background: #ec7049; color: white; }
        .wl-card-content { padding: 17px 18px 15px; }
        .wl-card-meta { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 8px; color: #85867c; font-size: 9px; font-weight: 900; letter-spacing: .07em; text-transform: uppercase; }
        .wl-card-title { border: 0; background: transparent; padding: 0; color: #20251f; font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; line-height: 1.2; text-align: left; }
        .wl-card-title:hover { color: #527044; }
        .wl-card-desc { min-height: 42px; margin: 8px 0 0; color: #71736a; font-size: 12px; line-height: 1.7; }
        .wl-card-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 13px; border-top: 1px solid #ece8dd; padding-top: 11px; color: #8b8b80; font-size: 9px; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }
        .wl-card-arrow { color: #20251f; font-size: 17px; transition: transform .2s; }
        .wl-card:hover .wl-card-arrow { transform: translateX(4px); }
        .wl-empty { border: 2px dashed #c9c4b7; border-radius: 8px; background: rgba(255,255,255,.6); padding: 55px 20px; text-align: center; }
        .wl-footer { border-top: 1px solid #e7e1d2; background: #f4f0e4; padding: 24px 5%; color: #797a70; font-size: 11px; font-weight: 700; text-align: center; }
        .dialog-backdrop { position: fixed; z-index: 50; inset: 0; display: grid; place-items: center; overflow-y: auto; background: rgba(22,26,22,.68); padding: 20px; backdrop-filter: blur(5px); animation: fade-in .18s ease-out both; }
        .wl-modal { position: relative; display: grid; width: 100%; max-width: 760px; overflow: hidden; grid-template-columns: repeat(2, minmax(0, 1fr)); border: 2px solid #20251f; border-radius: 8px; background: #fffdf7; box-shadow: 8px 8px 0 #20251f; }
        .wl-modal-gallery { position: relative; min-height: 420px; overflow: hidden; background: #e4dfd2; }
        .wl-modal-photo { display: block; width: 100%; height: 100%; min-height: 420px; object-fit: cover; animation: gallery-image-in .32s ease both; }
        .wl-gallery-controls { position: absolute; right: 12px; bottom: 12px; left: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; pointer-events: none; }
        .wl-gallery-arrow { display: grid; width: 36px; height: 36px; flex: none; place-items: center; border: 2px solid #20251f; border-radius: 50%; background: rgba(255,253,247,.94); box-shadow: 2px 2px 0 #20251f; color: #20251f; font-size: 20px; pointer-events: auto; }
        .wl-gallery-dots { display: flex; align-items: center; gap: 7px; border: 1px solid rgba(32,37,31,.4); border-radius: 99px; background: rgba(255,253,247,.9); padding: 8px 10px; pointer-events: auto; }
        .wl-gallery-dot { width: 8px; height: 8px; border: 1px solid #20251f; border-radius: 50%; background: #fffdf7; padding: 0; }
        .wl-gallery-dot[aria-pressed='true'] { background: #ec7049; box-shadow: 0 0 0 2px #fffdf7, 0 0 0 3px #20251f; }
        .wl-modal-content { display: flex; flex-direction: column; padding: 34px; }
        .wl-modal-close { position: absolute; z-index: 1; top: 12px; right: 12px; display: grid; width: 40px; height: 40px; place-items: center; border: 2px solid #20251f; border-radius: 50%; background: white; font-size: 22px; }
        .wl-modal-tag { width: fit-content; border-radius: 99px; background: #d6f263; padding: 6px 11px; font-size: 9px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
        .wl-modal-place { margin: 28px 0 0; color: #87887e; font-size: 10px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
        .wl-modal-title { margin: 8px 0 0; font-family: 'Space Grotesk', sans-serif; font-size: 34px; font-weight: 700; line-height: 1.05; }
        .wl-modal-note { margin: 16px 0; color: #686a62; font-size: 13px; line-height: 1.8; }
        .wl-modal-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: auto; padding-top: 20px; }
        .wl-modal-save { border: 2px solid #20251f; border-radius: 99px; background: #d6f263; padding: 12px 16px; box-shadow: 3px 3px 0 #20251f; font-size: 11px; font-weight: 900; }
        .wl-modal-back { border: 0; background: transparent; padding: 12px; color: #6e7068; font-size: 11px; font-weight: 700; }
        .dot-field { background-image: radial-gradient(rgba(32,37,31,.13) .8px, transparent .8px); background-size: 16px 16px; }
        @keyframes search-pop { 0% { transform: scale(.985); } 60% { transform: scale(1.015); } 100% { transform: translateY(-4px) scale(1); } }
        @keyframes heart-pop { 0% { transform: scale(.7); } 55% { transform: scale(1.35) rotate(-12deg); } 100% { transform: scale(1) rotate(0); } }
        @keyframes card-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes collection-card-pop { 0% { opacity: 0; transform: translateY(28px) scale(.9) rotate(-1deg); } 72% { opacity: 1; transform: translateY(-3px) scale(1.025) rotate(.3deg); } 100% { opacity: 1; transform: translateY(0) scale(1) rotate(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wallpaper-reveal { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gallery-image-in { from { opacity: .7; transform: scale(1.025); } to { opacity: 1; transform: scale(1); } }
        @media (max-width: 960px) { .wl-hero { grid-template-columns: minmax(0, 1fr) 260px; gap: 24px; padding-top: 48px; } .wl-hero-title { font-size: 60px; } .wl-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 960px) { .wl-map-layout { grid-template-columns: minmax(0, 1fr) minmax(280px, 1fr); gap: 24px; } .wl-map-title { font-size: 36px; } }
        @media (max-width: 960px) { .wl-portfolio-heading { grid-template-columns: 1fr; } .wl-portfolio-workspace { grid-template-columns: minmax(260px, .8fr) minmax(0, 1.2fr); gap: 20px; } }
        @media (max-width: 680px) { .wl-header { padding: 17px 20px; } .wl-nav { order: 3; width: 100%; justify-content: space-between; gap: 16px; } .wl-nav a { font-size: 12px; } .wl-open-count { display: none; } .wl-hero { grid-template-columns: 1fr; grid-template-areas: 'copy' 'progress'; gap: 24px; padding: 34px 20px 30px; } .wl-hero-title { margin-top: 20px; font-size: 48px; } .wl-hero-copy > p { font-size: 15px; } .wl-search { gap: 6px; margin-top: 24px; border-radius: 15px; } .wl-search-icon { width: 42px; height: 42px; } .wl-search-input { font-size: 10.5px; } .wl-search-submit { width: 42px; height: 42px; padding: 0; } .wl-search-submit.desktop { display: none; } .wl-search-submit.mobile { display: block; } .wl-progress-card { padding: 17px; } .wl-topics { padding: 20px; } .wl-topic-inner { gap: 11px; } .wl-topic-caption { width: 100%; } .wl-topic-count { display: none; } .topic-pill { padding: 9px 14px; font-size: 12px; } .wl-map-section { padding: 44px 20px; } .wl-map-layout { grid-template-columns: 1fr; gap: 14px; } .wl-map-title { font-size: 32px; } .wl-globe-stage { min-height: 330px; } .wl-globe { width: min(100%, 330px); } .wl-portfolio-section { padding: 46px 20px; } .wl-portfolio-heading { gap: 24px; margin-bottom: 28px; } .wl-portfolio-title { font-size: 34px; } .wl-portfolio-workspace { grid-template-columns: 1fr; } .wl-upload-zone { min-height: 260px; } .wl-project-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .wl-collections { padding: 38px 20px 60px; } .wl-collection-heading { align-items: start; flex-direction: column; gap: 10px; } .wl-section-title { font-size: 28px; } .wl-result-count { margin: 0; } .wl-card-grid { grid-template-columns: 1fr; gap: 17px; } .wl-card-content { padding: 15px; } .wl-modal { grid-template-columns: 1fr; } .wl-modal-gallery { height: 220px; min-height: 0; } .wl-modal-photo { height: 100%; min-height: 0; } .wl-modal-content { padding: 24px; } .wl-modal-place { margin-top: 18px; } .wl-modal-title { font-size: 29px; } }
        @media (max-width: 680px) { .wl-collection-tools { width: 100%; justify-content: space-between; } .wl-wallpaper-controls { margin-left: auto; } }
        @media (max-width: 680px) { .app-root.app-page-world-map .wl-map-section { height: calc(100vh - 54px); min-height: 0; padding: 24px 18px; } .app-root.app-page-world-map .wl-map-layout { grid-template-columns: 1fr; align-content: space-between; gap: 12px; } .app-root.app-page-world-map .wl-map-copy { max-width: none; } .app-root.app-page-world-map .wl-map-title { font-size: 32px; } .app-root.app-page-world-map .wl-map-description { margin-top: 10px; } .app-root.app-page-world-map .wl-map-search-label { margin-top: 12px; } .app-root.app-page-world-map .wl-map-xp { margin-top: 10px; } .app-root.app-page-world-map .wl-globe-stage { height: min(82vw, 42vh, 410px); } .app-root.app-page-world-map .wl-globe { width: min(90vw, 42vh, 410px); } }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
      `}</style>

      {activePage === 'collections' && <>
        <div key={`${activeTopic}-${wallpaperIndex}`} className="wl-wallpaper-layer" style={{ '--page-wash': topicWash, '--wallpaper-image': currentWallpaper.image, '--wallpaper-size': currentWallpaper.size, '--wallpaper-position': currentWallpaper.position }} aria-hidden="true" />
        <div className="wl-wallpaper-watermark" style={{ '--watermark-image': `url("${wallpaperPhotos.ideas[2]}")` }} aria-hidden="true" />
      </>}

      <header className="wl-header relative z-10 mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-14 lg:py-7">
        <a href="#top" className="wl-brand flex items-center gap-3 no-underline" aria-label="Worldloom home">
          <span className="wl-brand-mark grid h-10 w-10 -rotate-6 place-items-center rounded-xl bg-[#d6f263] text-xl font-black shadow-[3px_3px_0_#20251f]">w.</span>
          <span className="display-font wl-brand-name text-xl font-bold tracking-tight">worldloom<span className="text-[#ec7049]">*</span></span>
        </a>
        <nav className="wl-nav order-3 flex w-full items-center gap-6 overflow-x-auto text-sm font-bold sm:order-none sm:w-auto" aria-label="Main navigation">
          <a className={`whitespace-nowrap text-[#75776f] transition hover:text-[#20251f]${activePage === 'discover' ? ' is-active' : ''}`} href="#discover" onClick={(event) => { event.preventDefault(); navigateTo('discover'); }}>Discover</a>
          <a className={`whitespace-nowrap text-[#75776f] transition hover:text-[#20251f]${activePage === 'collections' ? ' is-active' : ''}`} href="#collections" onClick={(event) => { event.preventDefault(); navigateTo('collections', true); }}>Collections</a>
          <a className={`whitespace-nowrap text-[#75776f] transition hover:text-[#20251f]${activePage === 'world-map' ? ' is-active' : ''}`} href="#world-map" onClick={(event) => { event.preventDefault(); navigateTo('world-map'); }}>World Map</a>
          <a className={`whitespace-nowrap text-[#75776f] transition hover:text-[#20251f]${activePage === 'portfolio' ? ' is-active' : ''}`} href="#portfolio" onClick={(event) => { event.preventDefault(); navigateTo('portfolio'); }}>Portfolio</a>
          <a className={`whitespace-nowrap text-[#75776f] transition hover:text-[#20251f]${showSaved ? ' is-active' : ''}`} href="#saved" onClick={(event) => { event.preventDefault(); navigateTo('saved', true); }}>Saved <span className="saved-count ml-1 rounded-full bg-[#20251f] px-2 py-0.5 text-[10px] text-white">{savedIds.length}</span></a>
        </nav>
        <div className="wl-header-actions flex items-center gap-3">
          <span className="wl-open-count hidden rounded-full border border-[#dedbcc] px-3 py-2 text-xs font-bold sm:inline-flex">✦ {progress}/10 opens</span>
          <button type="button" onClick={() => { navigateTo('collections'); openCollection(collections[Math.floor(Math.random() * collections.length)]); }} className="wl-surprise rounded-full bg-[#20251f] px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#394538]">Surprise me ↗</button>
        </div>
      </header>

      <section id="discover" className="wl-hero relative mx-auto grid max-w-[1440px] gap-10 px-5 pb-12 pt-5 sm:px-8 md:grid-cols-[minmax(0,1fr)_300px] md:items-end lg:px-14 lg:pb-16 lg:pt-12">
        <div className="pointer-events-none absolute -left-24 top-4 h-56 w-56 rounded-full border-[1px] border-[#e8dfc9] md:left-[38%] md:top-0 md:h-72 md:w-72" />
        <div className="wl-hero-copy relative z-[1] max-w-4xl">
          <div className="wl-sticker mb-6 inline-flex rotate-[-2deg] items-center gap-2 rounded-md bg-[#ec7049] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.1em] text-white shadow-[3px_3px_0_#20251f]">
            <span aria-hidden="true">✳</span> Your next rabbit hole starts here
          </div>
          <h1 className="wl-hero-title display-font max-w-4xl text-[clamp(3.2rem,8vw,7.2rem)] font-bold leading-[.88] tracking-[-.075em]">
            Go where your <span className="wl-highlight relative inline-block">curiosity<span className="absolute -bottom-1 left-0 -z-10 h-[.23em] w-full -rotate-2 bg-[#d6f263] sm:-bottom-2" /></span> goes.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#66695f] sm:text-lg">Little collections for big “wait, tell me more” energy.</p>

          <form className="wl-search search-bounce mt-8 flex max-w-3xl items-center gap-2 rounded-2xl border-2 border-[#20251f] bg-white p-2 shadow-[0_6px_0_#20251f] transition-transform sm:rounded-[20px]" onSubmit={(event) => event.preventDefault()}>
            <span className="wl-search-icon grid h-12 w-12 flex-none place-items-center rounded-xl bg-[#f2efdF] text-xl" aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="wl-search-input min-w-0 flex-1 bg-transparent px-1 text-sm font-semibold outline-none placeholder:text-[#96978f] sm:text-base" placeholder="Search ideas e.g. quiet cafes in Kyoto" aria-label="Search ideas and collections" />
            <button type="submit" className="wl-search-submit desktop hidden rounded-xl bg-[#d6f263] px-5 py-3 text-sm font-extrabold transition hover:bg-[#c7e84c] sm:block">Find it <span aria-hidden="true">↗</span></button>
            <button type="submit" className="wl-search-submit mobile grid h-12 w-12 flex-none place-items-center rounded-xl bg-[#d6f263] text-xl font-bold sm:hidden" aria-label="Search">↗</button>
          </form>
          {search && activePage === 'discover' && <div id="discoverSearchResults" className="wl-discover-search-results" role="region" aria-label="Discover search results">
            <div className="wl-discover-search-head">
              <div className="wl-discover-search-title">Worldloom collections<strong>{visibleCollections.length} {visibleCollections.length === 1 ? 'match' : 'matches'}</strong></div>
              <div className="wl-discover-search-actions">
                <a href={`https://www.google.com/search?q=${encodeURIComponent(query.trim())}`} target="_blank" rel="noopener noreferrer">Search Google ↗</a>
                <button type="button" onClick={() => navigateTo('collections')}>See all collections ↗</button>
              </div>
            </div>
            {visibleCollections.length ? visibleCollections.slice(0, 4).map((collection) => <button key={collection.id} type="button" className="wl-discover-search-row" onClick={() => openCollection(collection)}>
              <img src={collection.image} alt="" />
              <span><strong>{collection.title}</strong><small>{collection.place} · {collection.category}</small></span>
              <em>Open ↗</em>
            </button>) : <p className="wl-discover-search-empty">No collection matches. Looking beyond your collection…</p>}
            {guideStatus && <p className="wl-discover-search-empty" role="status" aria-live="polite">{guideStatus}</p>}
            {guideResults.length > 0 && <div className="wl-discover-guide-list" aria-label="More ideas from Wikipedia">{guideResults.map((result) => <a key={result.url} className="wl-discover-guide" href={result.url} target="_blank" rel="noopener noreferrer">
              <img src={result.image} alt={`Illustration for ${result.title}`} loading="lazy" />
              <span className="wl-discover-guide-copy"><strong>{result.title}</strong><small>World guide · Wikipedia</small><p>{result.extract}</p></span>
              <span className="wl-discover-guide-arrow" aria-hidden="true">↗</span>
            </a>)}</div>}
          </div>}
        </div>

        <aside className="wl-progress-card relative z-[1] rounded-2xl border-2 border-[#20251f] bg-[#fffdf7] p-5 shadow-[5px_5px_0_#20251f] md:mb-1">
          <div className="wl-progress-head flex items-start justify-between gap-3">
            <div>
              <p className="wl-eyebrow text-[10px] font-extrabold uppercase tracking-[.14em] text-[#797b72]">Your side quest</p>
              <h2 className="wl-progress-title display-font mt-1 text-lg font-bold">Open 10 collections</h2>
            </div>
            <span className="wl-progress-count -rotate-6 rounded-lg bg-[#d6f263] px-2.5 py-1.5 text-xs font-black">{progress}/10</span>
          </div>
          <div className="wl-progress-label mt-5 flex items-center justify-between text-[11px] font-bold">
            <span className="text-[#5f655b]">{progress}/10 collections opened</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="wl-progress-track mt-2 h-3 overflow-hidden rounded-full border border-[#20251f] bg-[#edeadd]" role="progressbar" aria-label="Collections opened" aria-valuemin="0" aria-valuemax="10" aria-valuenow={progress}>
            <div className="progress-fill h-full rounded-full bg-[#ec7049]" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="wl-progress-note mt-3 text-[10px] font-medium text-[#85867c]">{10 - progress} more {10 - progress === 1 ? 'open' : 'opens'} to fill your passport.</p>
        </aside>
      </section>

      <section className="wl-topics dot-field border-y border-[#e7e1d2] bg-[#f4f0e4] px-5 py-6 sm:px-8 lg:px-14" aria-label="Browse by topic">
        <div className="wl-topic-inner mx-auto flex max-w-[1440px] flex-wrap items-center gap-3">
          <span className="wl-topic-caption mr-1 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#78796f]">Pick your mood</span>
          {topics.map((topic, index) => (
            <button key={topic} type="button" onClick={() => { setActiveTopic(activeTopic === topic ? 'All' : topic); navigateTo('collections'); }} aria-pressed={activeTopic === topic} data-color={index === 0 ? 'lime' : index === 1 ? 'coral' : 'white'} className={`topic-pill rounded-full border-2 border-[#20251f] px-5 py-2.5 text-sm font-extrabold shadow-[3px_3px_0_#20251f] ${index === 0 ? 'bg-[#d6f263] text-[#20251f]' : index === 1 ? 'bg-[#f8bba7] text-[#20251f]' : 'bg-white text-[#20251f]'}`}>
              {topic} <span className="ml-1 text-xs" aria-hidden="true">{index === 0 ? '✳' : index === 1 ? '↗' : '✦'}</span>
            </button>
          ))}
          <button type="button" onClick={() => { setActiveTopic('All'); navigateTo('collections'); }} data-color={activeTopic === 'All' ? 'white' : 'sand'} className={`topic-pill rounded-full border-2 border-[#20251f] px-4 py-2.5 text-sm font-bold shadow-[3px_3px_0_#20251f] ${activeTopic === 'All' ? 'bg-white' : 'bg-[#e4dfd2]'}`}>Everything</button>
          <span className="wl-topic-count ml-auto hidden text-xs font-semibold text-[#77796f] md:block">{visibleCollections.length} good places to start</span>
        </div>
      </section>

      <section className="wl-discover-picks" aria-labelledby="discover-picks-title">
        <div className="wl-discover-picks-inner">
          <div className="wl-discover-picks-head">
            <div><p className="wl-eyebrow">Three little rabbit holes</p><h2 id="discover-picks-title" className="wl-discover-picks-title">Start somewhere unexpected.</h2></div>
            <button className="wl-picks-browse" type="button" onClick={() => navigateTo('collections', true)}>Browse all collections ↗</button>
          </div>
          <div className="wl-path-grid">
            {collections.slice(0, 3).map((collection, index) => <article key={collection.id} className="wl-path-card">
              <button type="button" className="wl-path-button" onClick={() => openCollection(collection)} aria-label={`Open ${collection.title}, ${collection.place}`}>
                <span className="wl-path-photo"><img src={collection.image} alt="" loading="lazy" /><span className="wl-path-number">0{index + 1}</span></span>
                <span className="wl-path-copy"><span className="wl-path-meta">{collection.category} · {collection.minutes}</span><strong>{collection.title}</strong><span className="wl-path-place">{collection.place}</span></span>
              </button>
            </article>)}
          </div>
        </div>
      </section>

      <AtlasMap mapPlaces={mapPlaces} collectedMapIds={collectedMapIds} onCollect={collectMapPlace} onBack={() => navigateTo('discover')} isActive={activePage === 'world-map'} openedIds={openedIds} collections={collections} />

      <section id="portfolio" className="wl-portfolio-section px-5 py-16 sm:px-8 lg:px-14" aria-labelledby="portfolio-title">
        <div className="wl-portfolio-inner">
          <div className="wl-portfolio-heading">
            <div>
              <p className="wl-eyebrow">Your corner of the internet</p>
              <h2 id="portfolio-title" className="wl-portfolio-title">Make room for what you make.</h2>
              <p className="wl-portfolio-intro">A growing collection of places, projects, and ideas worth keeping close.</p>
            </div>
            <div className="wl-profile-card">
              <div className="wl-profile-person">
                <span className="wl-profile-avatar" aria-hidden="true">{portfolioName.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'WL'}</span>
                <div className="min-w-0 flex-1">
                  <label className="wl-eyebrow" htmlFor="portfolio-name">Creator name</label>
                  <input id="portfolio-name" className="wl-profile-name" value={portfolioName} onChange={(event) => setPortfolioName(event.target.value)} maxLength={60} />
                </div>
              </div>
              <label className="sr-only" htmlFor="portfolio-bio">Creator bio</label>
              <textarea id="portfolio-bio" className="wl-profile-bio" value={portfolioBio} onChange={(event) => setPortfolioBio(event.target.value)} maxLength={180} />
              <div className="wl-profile-progress-head"><span>Profile completion</span><span>78%</span></div>
              <div className="wl-profile-progress" role="progressbar" aria-label="Profile completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="78">
                <div className="wl-profile-progress-fill" />
              </div>
            </div>
          </div>

          <div className="wl-portfolio-workspace">
            <label
              className={`wl-upload-zone${portfolioDragActive ? ' is-dragging' : ''}`}
              onDragOver={(event) => { event.preventDefault(); setPortfolioDragActive(true); }}
              onDragLeave={() => setPortfolioDragActive(false)}
              onDrop={(event) => { event.preventDefault(); setPortfolioDragActive(false); addPortfolioFiles(event.dataTransfer.files); }}
            >
              <input className="wl-upload-input" type="file" accept="image/*" multiple aria-label="Upload portfolio images" onChange={(event) => { addPortfolioFiles(event.target.files); event.target.value = ''; }} />
              <span className="wl-upload-cloud" aria-hidden="true">☁️</span>
              <span className="wl-upload-title">Drop files here ☁️</span>
              <span className="wl-upload-hint">or browse images from your device<br />JPG, PNG, GIF, or WebP</span>
              <span className="wl-upload-browse">Browse images</span>
            </label>

            <div className="wl-portfolio-projects">
              <div className="wl-projects-heading">
                <h3 className="wl-projects-title">Featured work</h3>
                <span className="wl-projects-count">{portfolioFiles.length} {portfolioFiles.length === 1 ? 'project' : 'projects'}</span>
              </div>
              {portfolioFiles.length ? (
                <div className="wl-project-grid">
                  {portfolioFiles.map((file) => (
                    <article key={file.id} className="wl-project-item">
                      <img className="wl-project-image" src={file.preview} alt={file.name} />
                      <p className="wl-project-caption">{file.name}</p>
                      <button type="button" className="wl-project-remove" onClick={() => removePortfolioFile(file.id)} aria-label={`Remove ${file.name}`}>×</button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="wl-project-empty">Your featured projects will land here.</div>
              )}
              <p className="wl-portfolio-status" role="status" aria-live="polite">{portfolioMessage}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="collections" className="wl-collections mx-auto max-w-[1440px] px-5 pb-20 pt-10 sm:px-8 lg:px-14 lg:pt-14" style={{ '--collection-wash': activeTopic === 'Design' ? '#fff0e8' : activeTopic === 'Places' ? '#edf4e8' : activeTopic === 'Ideas' ? '#f1eee4' : '#fbf8ef' }}>
        <div className="wl-collection-heading mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#818278]">Fresh from the loom <span className="ml-1 text-[#ec7049]">✳</span></p>
            <h2 className="wl-section-title display-font text-3xl font-bold tracking-tight sm:text-4xl">{activeTopic === 'All' ? 'A few tabs you’ll enjoy opening.' : `${activeTopic} is having a moment.`}</h2>
          </div>
          <div className="wl-collection-tools">
            <p className="wl-result-count text-xs font-semibold text-[#7d7e74]">{visibleCollections.length} collections <span aria-hidden="true">·</span> 3 moods</p>
            <div className="wl-wallpaper-controls" role="group" aria-label={`${activeTopic === 'All' ? 'Everything' : activeTopic} background photos`}>
              <button type="button" onClick={() => stepWallpaper(-1)} aria-label="Previous background photo" title="Previous background photo">‹</button>
              <button type="button" onClick={() => stepWallpaper(1)} aria-label="Next background photo" title="Next background photo">›</button>
            </div>
          </div>
        </div>

        {visibleCollections.length ? (
          <div key={`${activeTopic}-${collectionVisit}`} className="wl-card-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
            {visibleCollections.map((collection) => {
              const isSaved = savedIds.includes(collection.id);
              const isOpened = openedIds.includes(collection.id);
              return (
                <article key={collection.id} className="wl-card collection-card group relative overflow-hidden rounded-2xl border-2 border-[#20251f] bg-white shadow-[4px_4px_0_#20251f] transition duration-200 hover:-translate-y-1 hover:shadow-[6px_8px_0_#20251f]">
                  <button type="button" onClick={() => openCollection(collection)} className="wl-card-photo relative block aspect-[4/3] w-full overflow-hidden text-left" aria-label={`Open ${collection.title}`}>
                    <img className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]" src={collection.image} alt={collection.imageAlt} loading="lazy" />
                    <span className="wl-category absolute left-3 top-3 rounded-full border border-[#20251f] bg-[#fffdf7] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide">{collection.category}</span>
                    {isOpened && <span className="wl-opened absolute bottom-3 left-3 rounded-full bg-[#d6f263] px-3 py-1.5 text-[10px] font-extrabold">Opened ✓</span>}
                  </button>
                  <button type="button" onClick={() => toggleSaved(collection.id)} aria-label={isSaved ? `Remove ${collection.title} from saved` : `Save ${collection.title}`} aria-pressed={isSaved} className={`heart-button ${isSaved && heartBurst === collection.id ? 'is-saved' : ''} absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border-2 border-[#20251f] text-xl shadow-[2px_2px_0_#20251f] ${isSaved ? 'bg-[#ec7049] text-white' : 'bg-white text-[#20251f]'}`}>
                    {isSaved ? '♥' : '♡'}
                  </button>
                  <div className="wl-card-content p-4 sm:p-5">
                    <div className="wl-card-meta mb-2 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wide text-[#85867c]">
                      <span>{collection.place}</span><span>{collection.minutes}</span>
                    </div>
                    <button type="button" onClick={() => openCollection(collection)} className="wl-card-title display-font text-left text-xl font-bold leading-tight tracking-tight transition group-hover:text-[#527044]">{collection.title}</button>
                    <p className="wl-card-desc mt-2 line-clamp-2 text-sm leading-6 text-[#71736a]">{collection.note}</p>
                    <div className="wl-card-bottom mt-4 flex items-center justify-between border-t border-[#ece8dd] pt-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-[.1em] text-[#8b8b80]">A tiny world to get lost in</span>
                      <span className="wl-card-arrow text-lg transition-transform group-hover:translate-x-1" aria-hidden="true">↗</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="wl-empty rounded-2xl border-2 border-dashed border-[#c9c4b7] bg-white/60 px-6 py-14 text-center">
            <span className="text-3xl" aria-hidden="true">⌕</span>
            <p className="display-font mt-3 text-xl font-bold">No match in this little universe.</p>
            <p className="mt-2 text-sm text-[#71736a]">{showSaved ? 'Tap a heart on anything you want to keep close.' : 'Try a different phrase or topic.'}</p>
            <button type="button" onClick={() => { setShowSaved(false); setQuery(''); setActiveTopic('All'); }} className="mt-4 rounded-full bg-[#20251f] px-4 py-2 text-xs font-bold text-white">Reset the vibes</button>
          </div>
        )}
      </section>

      <footer className="wl-footer border-t border-[#e7e1d2] bg-[#f4f0e4] px-5 py-6 text-center text-xs font-semibold text-[#797a70] sm:px-8">
        Made for your next “one more link” moment <span className="text-[#ec7049]">♥</span>
      </footer>

      {selectedCollection && (
        <div className="dialog-backdrop wl-modal-backdrop fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#161a16]/65 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCollection(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="collection-dialog-title" className="wl-modal relative grid w-full max-w-3xl overflow-hidden rounded-2xl border-2 border-[#20251f] bg-[#fffdf7] shadow-[8px_8px_0_#20251f] sm:grid-cols-2">
            <div className="wl-modal-gallery">
              <img key={selectedPhotos[galleryIndex].image} className="wl-modal-photo" src={selectedPhotos[galleryIndex].image} alt={selectedPhotos[galleryIndex].alt} />
              <div className="wl-gallery-controls">
                <button type="button" className="wl-gallery-arrow" onClick={() => stepCollectionPhoto(-1)} aria-label="Previous collection photo">‹</button>
                <div className="wl-gallery-dots" role="group" aria-label="Choose collection photo">{selectedPhotos.map((photo, index) => <button key={photo.image} type="button" className="wl-gallery-dot" onClick={() => setGalleryIndex(index)} aria-label={`Show photo ${index + 1}`} aria-pressed={galleryIndex === index} />)}</div>
                <button type="button" className="wl-gallery-arrow" onClick={() => stepCollectionPhoto(1)} aria-label="Next collection photo">›</button>
              </div>
            </div>
            <div className="wl-modal-content flex flex-col p-6 sm:p-8">
              <button type="button" onClick={() => setSelectedCollection(null)} className="wl-modal-close absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border-2 border-[#20251f] bg-white text-xl font-bold" aria-label="Close collection">×</button>
              <span className="wl-modal-tag w-fit rounded-full bg-[#d6f263] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide">{selectedCollection.category}</span>
              <p className="wl-modal-place mt-8 text-xs font-bold uppercase tracking-wide text-[#87887e]">{selectedCollection.place} <span className="px-1">·</span> {selectedCollection.minutes}</p>
              <h2 id="collection-dialog-title" className="wl-modal-title display-font mt-2 text-3xl font-bold leading-tight tracking-tight">{selectedCollection.title}</h2>
              <p className="wl-modal-note mt-4 text-sm leading-7 text-[#686a62]">{selectedCollection.note}</p>
              <div className="wl-modal-actions mt-auto flex flex-wrap items-center gap-3 pt-8">
                <button type="button" onClick={() => toggleSaved(selectedCollection.id)} aria-pressed={savedIds.includes(selectedCollection.id)} className="wl-modal-save rounded-full border-2 border-[#20251f] bg-[#d6f263] px-4 py-3 text-xs font-extrabold shadow-[3px_3px_0_#20251f]">{savedIds.includes(selectedCollection.id) ? '♥ Saved' : '♡ Save this one'}</button>
                <button type="button" onClick={() => setSelectedCollection(null)} className="wl-modal-back rounded-full px-4 py-3 text-xs font-bold text-[#6e7068] transition hover:text-[#20251f]">Back to wandering</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}