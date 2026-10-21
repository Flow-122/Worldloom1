const discover = document.getElementById('discover-page');
      const explorePage = document.getElementById('explore-page');
      const collectionsPage = document.getElementById('collections-page');
      const portfolioPage = document.getElementById('portfolio-page');
      const atlasStatusPage = document.getElementById('atlas-status-page');
      const mapPage = document.getElementById('map-page');
      const openMapButtons = document.querySelectorAll('[data-open-map]');
      const openCollectionsButtons = document.querySelectorAll('[data-open-collections]');
      const backButton = document.getElementById('backToDiscover');
      const navMapButton = document.querySelector('[data-open-map-link]');
      const navDiscoverButton = document.querySelector('[data-show-discover]');
      const navExploreButton = document.querySelector('[data-show-explore]');
      const navCollectionsButton = document.querySelector('[data-show-collections]');
      const navSavedButton = document.querySelector('[data-show-saved]');
      const navPortfolioButton = document.querySelector('[data-show-portfolio]');
      const navLinks = document.querySelectorAll('.nav a');

      const updateNav = (activeLink) => {
        navLinks.forEach((link) => link.classList.toggle('active', link === activeLink));
      };

      const showPage = (page, activeLink) => {
        [discover, explorePage, collectionsPage, portfolioPage, atlasStatusPage, mapPage].forEach((view) => view.classList.toggle('active', view === page));
        updateNav(activeLink);
      };

      const showMap = () => {
        showPage(mapPage, navMapButton);
      };

      const showDiscover = () => {
        showPage(discover, navDiscoverButton);
      };

      const showExplore = () => {
        showPage(explorePage, navExploreButton);
      };

      const showAtlasStatus = () => {
        showPage(atlasStatusPage, navDiscoverButton);
      };

      openMapButtons.forEach((button) => button.addEventListener('click', showMap));
      openCollectionsButtons.forEach((button) => button.addEventListener('click', () => showCollections(false)));
      document.querySelectorAll('[data-open-atlas-status]').forEach((button) => button.addEventListener('click', showAtlasStatus));
      if (navMapButton) {
        navMapButton.addEventListener('click', (event) => {
          event.preventDefault();
          showMap();
        });
      }
      backButton.addEventListener('click', showDiscover);

      document.querySelectorAll('[data-show-discover]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          showDiscover();
        });
      });

      document.querySelectorAll('[data-show-explore]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          showExplore();
        });
      });

      navCollectionsButton.addEventListener('click', (event) => {
        event.preventDefault();
        showCollections(false);
      });

      navSavedButton.addEventListener('click', (event) => {
        event.preventDefault();
        showCollections(true);
      });

      navPortfolioButton.addEventListener('click', (event) => {
        event.preventDefault();
        showPortfolio();
      });

      navMapButton.addEventListener('click', showMap);

      const earthScenes = [];
      const locationSearch = document.getElementById('locationSearch');
      const locationResults = document.getElementById('locationResults');
      const regionBrowser = document.getElementById('regionBrowser');
      const regionCountryList = document.getElementById('regionCountryList');
      const regionCountryTitle = document.getElementById('regionCountryTitle');
      const regionCountryStatus = document.getElementById('regionCountryStatus');
      const regionSubdivisionToggle = document.getElementById('regionSubdivisionToggle');
      const flagColorResults = document.getElementById('flagColorResults');
      const flagColorStatus = document.getElementById('flagColorStatus');
      const selectedFlagColors = new Set();
      const flagPaletteCache = new Map();
      let flagColorSearchId = 0;
      let activeMapView = 'explore';
      let subdivisionCountry = null;
      let showingSubdivisions = false;
      const continentLocations = [
        { name: 'Africa', type: 'Continent', continent: 'Africa', lat: 0, lon: 20 },
        { name: 'Asia', type: 'Continent', continent: 'Asia', lat: 34, lon: 100 },
        { name: 'Europe', type: 'Continent', continent: 'Europe', lat: 50, lon: 15 },
        { name: 'North America', type: 'Continent', continent: 'North America', lat: 40, lon: -100 },
        { name: 'South America', type: 'Continent', continent: 'South America', lat: -15, lon: -60 },
        { name: 'Oceania', type: 'Continent', continent: 'Oceania', lat: -20, lon: 135 }
      ];
      let countryLocations = [];
      let stateLocations = [];
      let locations = [...continentLocations];
      let selectedLocation = null;
      let locationsLoaded = false;

      const regionToContinent = (region, subregion = '') => {
        if (region !== 'Americas') return region;
        return subregion === 'South America' ? 'South America' : 'North America';
      };

      Promise.all([
        fetch('https://cdn.jsdelivr.net/npm/world-countries@5.0.0/countries.json').then((response) => response.json()),
        fetch('https://cdn.jsdelivr.net/npm/country-state-city@3.2.1/lib/assets/state.json').then((response) => response.json())
      ])
        .then(([countries, states]) => {
          countryLocations = countries
            .filter((country) => country.latlng?.length === 2 && country.region)
            .map((country) => ({
              name: country.name.common,
              type: 'Country',
              continent: regionToContinent(country.region, country.subregion),
              lat: country.latlng[0],
              lon: country.latlng[1],
              countryCode: country.cca2,
              languages: Object.values(country.languages || {})
            }));
          const countryByCode = new Map(countryLocations.map((country) => [country.countryCode, country]));
          stateLocations = states
            .filter((state) => state.latitude !== '' && state.latitude != null
              && state.longitude !== '' && state.longitude != null
              && countryByCode.has(state.countryCode))
            .map((state) => {
              const country = countryByCode.get(state.countryCode);
              return {
                name: state.name,
                type: 'State / province',
                continent: country.continent,
                country: country.name,
                lat: Number(state.latitude),
                lon: Number(state.longitude),
                countryCode: state.countryCode,
                languages: country.languages
              };
            });
          locations = [...continentLocations, ...countryLocations, ...stateLocations];
          locationsLoaded = true;
          renderRegionCountries(getActiveContinent());
          if (selectedFlagColors.size) searchFlagsByColor();
          if (locationSearch.value) renderSearchResults(locationSearch.value);
        })
        .catch(() => {
          locationsLoaded = true;
          renderRegionCountries(getActiveContinent());
          if (selectedFlagColors.size) searchFlagsByColor();
          if (locationSearch.value) renderSearchResults(locationSearch.value);
        });

      function getActiveContinent() {
        return document.querySelector('[data-continent].active')?.dataset.continent || 'Europe';
      }

      function renderRegionCountries(continent) {
        regionCountryTitle.textContent = showingSubdivisions && subdivisionCountry
          ? `${subdivisionCountry.name} states / provinces`
          : `${continent} countries`;
        regionSubdivisionToggle.hidden = !subdivisionCountry;
        regionSubdivisionToggle.textContent = showingSubdivisions ? 'Back to countries' : 'Browse states / provinces';
        regionSubdivisionToggle.setAttribute('aria-pressed', String(showingSubdivisions));
        regionCountryList.replaceChildren();
        regionCountryStatus.hidden = true;

        if (!locationsLoaded) {
          regionCountryStatus.textContent = 'Loading countries…';
          regionCountryStatus.hidden = false;
          return;
        }

        const places = showingSubdivisions && subdivisionCountry
          ? stateLocations.filter((place) => place.countryCode === subdivisionCountry.countryCode)
          : countryLocations.filter((country) => country.continent === continent);
        places.sort((first, second) => first.name.localeCompare(second.name));

        if (!places.length) {
          regionCountryStatus.textContent = showingSubdivisions
            ? `No state or province records are available for ${subdivisionCountry.name}.`
            : 'Countries are unavailable right now.';
          regionCountryStatus.hidden = false;
          return;
        }

        places.forEach((place) => {
          const option = document.createElement('button');
          option.type = 'button';
          option.className = 'region-country-option';
          option.setAttribute('aria-pressed', String(
            selectedLocation?.name === place.name
            && selectedLocation?.type === place.type
            && selectedLocation?.countryCode === place.countryCode
          ));
          const flag = document.createElement('img');
          flag.alt = '';
          flag.src = `https://flagcdn.com/w40/${place.countryCode.toLowerCase()}.png`;
          flag.onerror = () => { flag.hidden = true; };
          const label = document.createElement('span');
          label.textContent = place.name;
          option.append(flag, label);
          option.addEventListener('click', () => selectLocation(place));
          regionCountryList.append(option);
        });
      }

      function classifyFlagPixel(red, green, blue) {
        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);
        const delta = max - min;
        const saturation = max === 0 ? 0 : delta / max;
        if (max < 52) return 'black';
        if (saturation < 0.2) return max > 190 ? 'white' : null;

        let hue;
        if (max === red) hue = 60 * (((green - blue) / delta) % 6);
        else if (max === green) hue = 60 * ((blue - red) / delta + 2);
        else hue = 60 * ((red - green) / delta + 4);
        if (hue < 0) hue += 360;

        if (hue < 15 || hue >= 345) return 'red';
        if (hue < 43) return 'orange';
        if (hue < 70) return 'yellow';
        if (hue < 165) return 'green';
        if (hue < 255) return 'blue';
        return 'purple';
      }

      async function getFlagPalette(countryCode) {
        const code = countryCode.toLowerCase();
        if (!flagPaletteCache.has(code)) {
          flagPaletteCache.set(code, (async () => {
            const response = await fetch(`https://flagcdn.com/w80/${code}.png`);
            if (!response.ok) throw new Error('Flag image unavailable');
            const image = await createImageBitmap(await response.blob());
            const canvas = document.createElement('canvas');
            canvas.width = 36;
            canvas.height = 24;
            const context = canvas.getContext('2d', { willReadFrequently: true });
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
            const counts = new Map();
            let visiblePixels = 0;

            for (let index = 0; index < data.length; index += 4) {
              if (data[index + 3] < 128) continue;
              visiblePixels += 1;
              const color = classifyFlagPixel(data[index], data[index + 1], data[index + 2]);
              if (color) counts.set(color, (counts.get(color) || 0) + 1);
            }

            image.close();
            return new Set([...counts]
              .filter(([, count]) => count / visiblePixels >= 0.035)
              .map(([color]) => color));
          })());
        }

        try {
          return await flagPaletteCache.get(code);
        } catch {
          flagPaletteCache.delete(code);
          return null;
        }
      }

      function renderFlagColorMatches(matches) {
        flagColorResults.replaceChildren();
        matches.forEach((country) => {
          const option = document.createElement('button');
          option.type = 'button';
          option.className = 'region-country-option';
          const flag = document.createElement('img');
          flag.alt = '';
          flag.src = `https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png`;
          flag.onerror = () => { flag.hidden = true; };
          const label = document.createElement('span');
          label.textContent = country.name;
          option.append(flag, label);
          option.addEventListener('click', () => selectLocation(country));
          flagColorResults.append(option);
        });
        flagColorResults.hidden = matches.length === 0;
      }

      async function searchFlagsByColor() {
        const searchId = ++flagColorSearchId;
        const colors = [...selectedFlagColors];
        if (colors.length === 0) {
          flagColorResults.replaceChildren();
          flagColorResults.hidden = true;
          flagColorStatus.textContent = 'Choose colors';
          return;
        }
        if (!locationsLoaded) {
          flagColorStatus.textContent = 'Loading countries…';
          return;
        }

        const candidates = countryLocations.filter((country) => /^[a-z]{2}$/i.test(country.countryCode || ''));
        let nextCountry = 0;
        let checkedCountries = 0;
        const matches = [];
        flagColorStatus.textContent = `Checking flags 0 / ${candidates.length}`;

        const worker = async () => {
          while (nextCountry < candidates.length && searchId === flagColorSearchId) {
            const country = candidates[nextCountry++];
            const palette = await getFlagPalette(country.countryCode);
            if (searchId !== flagColorSearchId) return;
            if (palette && colors.every((color) => palette.has(color))) matches.push(country);
            checkedCountries += 1;
            if (checkedCountries % 20 === 0 || checkedCountries === candidates.length) {
              flagColorStatus.textContent = `Checking flags ${checkedCountries} / ${candidates.length}`;
            }
          }
        };

        await Promise.all(Array.from({ length: Math.min(12, candidates.length) }, worker));
        if (searchId !== flagColorSearchId) return;
        matches.sort((first, second) => first.name.localeCompare(second.name));
        renderFlagColorMatches(matches);
        flagColorStatus.textContent = matches.length
          ? `${matches.length} ${matches.length === 1 ? 'country' : 'countries'} match all selected colors`
          : 'No flags match all selected colors';
      }

      document.querySelectorAll('[data-flag-color]').forEach((button) => {
        button.addEventListener('click', () => {
          clearSelectedCountryFlag();
          const color = button.dataset.flagColor;
          if (selectedFlagColors.has(color)) selectedFlagColors.delete(color);
          else selectedFlagColors.add(color);
          button.setAttribute('aria-pressed', String(selectedFlagColors.has(color)));
          searchFlagsByColor();
        });
      });

      regionSubdivisionToggle.addEventListener('click', () => {
        if (!subdivisionCountry) return;
        showingSubdivisions = !showingSubdivisions;
        renderRegionCountries(getActiveContinent());
      });

      document.querySelectorAll('[data-map-view]').forEach((button) => {
        button.addEventListener('click', () => {
          activeMapView = button.dataset.mapView;
          document.querySelectorAll('[data-map-view]').forEach((tab) => {
            const isActive = tab === button;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-pressed', String(isActive));
          });
          regionBrowser.hidden = activeMapView !== 'regions';
          if (activeMapView === 'regions') renderRegionCountries(getActiveContinent());
        });
      });

      function renderSearchResults(query) {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        locationResults.replaceChildren();
        if (!normalizedQuery) {
          locationResults.hidden = true;
          locationSearch.setAttribute('aria-expanded', 'false');
          return;
        }

        const matches = locations.filter((place) =>
          `${place.name} ${place.continent} ${place.country || ''}`.toLocaleLowerCase().includes(normalizedQuery)
        ).sort((first, second) => {
          const rank = (place) => {
            const name = place.name.toLocaleLowerCase();
            if (name === normalizedQuery) return 0;
            if (name.startsWith(normalizedQuery)) return 1;
            return 2;
          };
          return rank(first) - rank(second);
        }).slice(0, 8);

        if (matches.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'search-empty';
          empty.textContent = locationsLoaded ? 'No matching places' : 'Loading places…';
          locationResults.append(empty);
        } else {
          matches.forEach((place) => {
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'search-result';
            option.setAttribute('role', 'option');
            option.innerHTML = `<span class="search-result-main"><img class="search-result-flag" alt="" hidden /><span class="search-result-text"><strong></strong><small></small><small class="search-result-languages" hidden></small></span></span><span class="result-kind"></span>`;
            option.querySelector('strong').textContent = place.name;
            option.querySelector('small').textContent = place.country ? `${place.country} · ${place.continent}` : place.continent;
            const languages = option.querySelector('.search-result-languages');
            if (place.languages?.length) {
              const label = place.type === 'State / province' ? 'Country languages' : 'Languages';
              languages.textContent = `${label}: ${place.languages.join(', ')}`;
              languages.hidden = false;
            }
            option.querySelector('.result-kind').textContent = place.type;
            const flag = option.querySelector('.search-result-flag');
            if (place.countryCode && /^[a-z]{2}$/i.test(place.countryCode)) {
              flag.onerror = () => { flag.hidden = true; };
              flag.src = `https://flagcdn.com/w40/${place.countryCode.toLowerCase()}.png`;
              flag.hidden = false;
            }
            option.addEventListener('click', () => selectLocation(place));
            locationResults.append(option);
          });
        }
        locationResults.hidden = false;
        locationSearch.setAttribute('aria-expanded', 'true');
      }

      locationSearch.addEventListener('focus', clearSelectedCountryFlag);
      locationSearch.addEventListener('input', () => {
        clearSelectedCountryFlag();
        renderSearchResults(locationSearch.value);
      });
      locationSearch.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          locationResults.hidden = true;
          locationSearch.setAttribute('aria-expanded', 'false');
        }
        if (event.key === 'Enter' && !locationResults.hidden) {
          event.preventDefault();
          locationResults.querySelector('.search-result')?.click();
        }
      });

      document.querySelectorAll('[data-continent]').forEach((button) => {
        button.addEventListener('click', () => {
          document.querySelectorAll('[data-continent]').forEach((chip) => chip.classList.toggle('active', chip === button));
          subdivisionCountry = null;
          showingSubdivisions = false;
          const continent = continentLocations.find((place) => place.name === button.dataset.continent);
          renderRegionCountries(button.dataset.continent);
          if (continent) selectLocation(continent);
        });
      });

      function selectLocation(place) {
        selectedLocation = place;
        locationSearch.value = place.name;
        locationResults.hidden = true;
        locationSearch.setAttribute('aria-expanded', 'false');

        document.getElementById('selectedLocationName').textContent = place.name;
        document.getElementById('selectedLocationType').textContent = place.type;
        document.getElementById('selectedContinent').textContent = place.continent;
        document.getElementById('selectedCoordinates').textContent = `${place.lat.toFixed(2)}, ${place.lon.toFixed(2)}`;
        document.getElementById('selectedPlaceType').textContent = place.subdivision
          ? `${place.subdivision} · ${place.country}`
          : place.country || place.type;
        document.getElementById('mapPinName').textContent = place.name;
        document.getElementById('mapPinSubtitle').textContent = place.subdivision
          ? `${place.subdivision} · ${place.country}`
          : place.country ? `${place.country} · ${place.continent}` : place.continent;
        const flag = document.getElementById('mapPinFlag');
        const countryCode = place.countryCode || countryLocations.find((country) => country.name === place.country)?.countryCode;
        if (countryCode && /^[a-z]{2}$/i.test(countryCode)) {
          flag.onerror = () => { flag.hidden = true; };
          flag.src = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
          flag.alt = `${place.country || place.name} flag`;
          flag.hidden = false;
        } else {
          flag.removeAttribute('src');
          flag.alt = '';
          flag.hidden = true;
        }
        document.getElementById('mapPinLabel').hidden = false;

        document.querySelectorAll('[data-continent]').forEach((chip) => {
          chip.classList.toggle('active', chip.dataset.continent === place.continent);
        });
        subdivisionCountry = place.countryCode
          ? countryLocations.find((country) => country.countryCode === place.countryCode) || null
          : countryLocations.find((country) => country.name === place.country) || null;
        showingSubdivisions = place.type === 'State / province';
        renderRegionCountries(place.continent);

        const map = earthScenes.find((earthScene) => earthScene.host.id === 'mapSurface');
        if (map) {
          clearCountryFlags(map);
          const country = place.countryCode
            ? countryLocations.find((candidate) => candidate.countryCode === place.countryCode)
            : countryLocations.find((candidate) => candidate.name === place.country);
          if (country) addCountryFlag(map, country);

          const latitude = THREE.MathUtils.degToRad(place.lat);
          const longitude = THREE.MathUtils.degToRad(place.lon);
          const latitudeRadius = Math.cos(latitude);
          map.pin.position.set(
            latitudeRadius * Math.cos(longitude),
            Math.sin(latitude),
            -latitudeRadius * Math.sin(longitude)
          ).multiplyScalar(1.018);
          map.pin.visible = true;
          map.earth.rotation.x = latitude;
          map.earth.rotation.y = -Math.PI / 2 - longitude;
        }
      }

      function clearCountryFlags(map) {
        map.countryFlags.forEach((flag) => {
          map.earth.remove(flag);
          flag.material.map?.dispose();
          flag.material.dispose();
        });
        map.countryFlags.clear();
      }

      function clearSelectedCountryFlag() {
        const map = earthScenes.find((earthScene) => earthScene.host.id === 'mapSurface');
        if (map) clearCountryFlags(map);
        document.getElementById('mapPinFlag').hidden = true;
      }

      function addCountryFlag(map, country) {
        const countryCode = country.countryCode.toLowerCase();
        if (map.countryFlags.has(countryCode)) return;

        const latitude = THREE.MathUtils.degToRad(country.lat);
        const longitude = THREE.MathUtils.degToRad(country.lon);
        const flag = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
        flag.position.set(
          Math.cos(latitude) * Math.cos(longitude),
          Math.sin(latitude),
          -Math.cos(latitude) * Math.sin(longitude)
        ).multiplyScalar(1.035);
        map.earth.add(flag);
        map.countryFlags.set(countryCode, flag);

        new THREE.TextureLoader().load(
          `https://flagcdn.com/w80/${countryCode}.png`,
          (texture) => {
            if (map.countryFlags.get(countryCode) !== flag) {
              texture.dispose();
              return;
            }
            texture.encoding = THREE.sRGBEncoding;
            flag.material.map = texture;
            flag.material.needsUpdate = true;
            flag.scale.set(0.15 * texture.image.width / texture.image.height, 0.15, 1);
          },
          undefined,
          () => {
            map.earth.remove(flag);
            if (map.countryFlags.get(countryCode) === flag) map.countryFlags.delete(countryCode);
            flag.material.dispose();
          }
        );
      }

      const featureCollections = {
        'modern-interiors': {
          title: 'Modern interiors',
          group: 'Spaces',
          category: 'Spaces & design',
          description: 'Explore thoughtful rooms shaped by warm natural materials, sculptural furniture, and soft daylight. This collection follows designers creating calm, tactile spaces for everyday life.',
          location: 'Copenhagen, Denmark',
          place: { name: 'Copenhagen', type: 'City', continent: 'Europe', country: 'Denmark', lat: 55.6761, lon: 12.5683 },
          images: [
            { src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85', alt: 'Sunlit modern living room with warm natural textures' },
            { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85', alt: 'Minimal living room with contemporary furniture' },
            { src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85', alt: 'Bright modern interior with a view of the garden' }
          ]
        },
        'creative-cities': {
          title: 'Creative cities',
          group: 'Cities',
          category: 'City guides',
          description: 'A field guide to the neighbourhoods where galleries, independent studios, architecture, and street life meet. Start with Tokyo and follow the local creative scene.',
          location: 'Tokyo, Japan',
          place: { name: 'Tokyo', type: 'City', continent: 'Asia', country: 'Japan', lat: 35.6762, lon: 139.6503 },
          images: [
            { src: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85', alt: 'City skyline illuminated at dusk' },
            { src: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=85', alt: 'Dense downtown skyline viewed from above' },
            { src: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85', alt: 'City lights across the skyline at night' }
          ]
        },
        'new-perspectives': {
          title: 'New perspectives',
          group: 'Architecture',
          category: 'Architecture & ideas',
          description: 'Discover buildings and public places that change how a city feels. This collection looks at expressive forms, unexpected materials, and architecture in conversation with its surroundings.',
          location: 'Barcelona, Spain',
          place: { name: 'Barcelona', type: 'City', continent: 'Europe', country: 'Spain', lat: 41.3874, lon: 2.1686 },
          images: [
            { src: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85', alt: 'Sculptural contemporary architecture against the sky' },
            { src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=85', alt: 'Modern white architecture with dramatic lines' },
            { src: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=85', alt: 'Contemporary building facade seen from below' }
          ]
        },
        'cafe-culture': {
          title: 'Cafe culture',
          group: 'Food & culture',
          category: 'Food & culture',
          description: 'Step into neighborhood cafes, local rituals, and small places that make a city feel like itself. A photo-led wander through welcoming tables and everyday design.',
          location: 'Paris, France',
          place: { name: 'Paris', type: 'City', continent: 'Europe', country: 'France', lat: 48.8566, lon: 2.3522 },
          images: [
            { src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=85', alt: 'Warm neighborhood cafe interior' },
            { src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=85', alt: 'Cafe tables and coffee bar' },
            { src: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=85', alt: 'Sunlit cafe seating beside a window' }
          ]
        },
        'art-around-us': {
          title: 'Art around us',
          group: 'Art',
          category: 'Art & galleries',
          description: 'Browse expressive work, intimate galleries, and public art that rewards a closer look. A collection for finding creative details in familiar and faraway places.',
          location: 'Florence, Italy',
          place: { name: 'Florence', type: 'City', continent: 'Europe', country: 'Italy', lat: 43.7696, lon: 11.2558 },
          images: [
            { src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=85', alt: 'Colorful painting in a gallery' },
            { src: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?auto=format&fit=crop&w=1200&q=85', alt: 'Gallery wall with a collection of artworks' },
            { src: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1200&q=85', alt: 'Framed contemporary artwork on display' }
          ]
        },
        'slow-escapes': {
          title: 'Slow escapes',
          group: 'Nature',
          category: 'Nature & outdoors',
          description: 'A slower route through alpine views, forest paths, and quiet lakes. Find outdoor places that invite you to take the long way and stay a little longer.',
          location: 'South Island, New Zealand',
          place: { name: 'South Island', type: 'Region', continent: 'Oceania', country: 'New Zealand', lat: -44.0, lon: 170.0 },
          images: [
            { src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85', alt: 'Quiet alpine lake surrounded by mountains' },
            { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85', alt: 'Sunlight falling across a forest trail' },
            { src: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1200&q=85', alt: 'Open mountain landscape along a winding road' }
          ]
        },
        'creative-workspaces': {
          title: 'Creative workspaces',
          group: 'Spaces',
          category: 'Spaces & design',
          description: 'Studios built for focus and collaboration, from flexible work tables to light-filled rooms. Collect ideas for a workspace with character and room to think.',
          location: 'New York, United States',
          place: { name: 'New York', type: 'City', continent: 'North America', country: 'United States', lat: 40.7128, lon: -74.006 },
          images: [
            { src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85', alt: 'Bright collaborative creative studio' },
            { src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85', alt: 'Modern shared workspace with large windows' },
            { src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85', alt: 'Contemporary city office architecture' }
          ]
        },
        'coastal-routes': {
          title: 'Coastal routes',
          group: 'Travel',
          category: 'Travel & places',
          description: 'Follow coastal roads, salt-air villages, and bright stretches of shoreline. A collection of scenic routes for planning a slower trip with room to wander.',
          location: 'Amalfi Coast, Italy',
          place: { name: 'Amalfi Coast', type: 'Region', continent: 'Europe', country: 'Italy', lat: 40.6281, lon: 14.4849 },
          images: [
            { src: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=85', alt: 'Waves rolling onto a bright coastline' },
            { src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85', alt: 'Scenic landscape along a coastal journey' },
            { src: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1200&q=85', alt: 'Winding road through a dramatic landscape' }
          ]
        }
      };

      const destinationGuides = [
        {
          name: 'Seoul', type: 'City', continent: 'Asia', country: 'South Korea', countryCode: 'KR',
          lat: 37.5665, lon: 126.9780,
          description: 'Explore royal palaces, traditional Bukchon streets, markets, and contemporary neighborhoods.',
          articleUrl: 'https://en.wikipedia.org/wiki/Seoul',
          image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Skyline_view_from_Seoul_City_%28South_Korea%29.jpg/960px-Skyline_view_from_Seoul_City_%28South_Korea%29.jpg',
          imageAlt: 'Seoul skyline viewed across the city',
          creditUrl: 'https://commons.wikimedia.org/wiki/File:Skyline_view_from_Seoul_City_(South_Korea).jpg'
        },
        {
          name: 'Busan', type: 'City', continent: 'Asia', country: 'South Korea', countryCode: 'KR',
          lat: 35.1796, lon: 129.0756,
          description: 'A coastal city known for Haeundae Beach, Jagalchi Market, and hillside Gamcheon Culture Village.',
          articleUrl: 'https://en.wikipedia.org/wiki/Busan',
          image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Haeundae_Beach_in_Busan.jpg/960px-Haeundae_Beach_in_Busan.jpg',
          imageAlt: 'Haeundae Beach along the Busan coast',
          creditUrl: 'https://commons.wikimedia.org/wiki/File:Haeundae_Beach_in_Busan.jpg'
        },
        {
          name: 'Jeju Island', type: 'Island', continent: 'Asia', country: 'South Korea', countryCode: 'KR',
          lat: 33.4996, lon: 126.5312,
          description: 'Volcanic landscapes, Hallasan, lava tubes, and coastal walking trails.',
          articleUrl: 'https://en.wikipedia.org/wiki/Jeju_Island',
          image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Hydrangea_macrophylla_in_front_of_Seongsan_Ilchulbong_volcano_at_blue_hour_in_Jeju_Island_South_Korea.jpg/960px-Hydrangea_macrophylla_in_front_of_Seongsan_Ilchulbong_volcano_at_blue_hour_in_Jeju_Island_South_Korea.jpg',
          imageAlt: 'Seongsan Ilchulbong volcano on Jeju Island at blue hour',
          creditUrl: 'https://commons.wikimedia.org/wiki/File:Hydrangea_macrophylla_in_front_of_Seongsan_Ilchulbong_volcano_at_blue_hour_in_Jeju_Island_South_Korea.jpg'
        },
        {
          name: 'Gyeongju', type: 'City', continent: 'Asia', country: 'South Korea', countryCode: 'KR',
          lat: 35.8562, lon: 129.2247,
          description: 'Historic temples, royal tombs, and heritage sites from the Silla kingdom.',
          articleUrl: 'https://en.wikipedia.org/wiki/Gyeongju',
          image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Bulguksa_temple_entrance_gate_stairs_flower_bed_and_blue_sky_in_Gyeongju_South_Korea.jpg/960px-Bulguksa_temple_entrance_gate_stairs_flower_bed_and_blue_sky_in_Gyeongju_South_Korea.jpg',
          imageAlt: 'Bulguksa temple entrance in Gyeongju',
          creditUrl: 'https://commons.wikimedia.org/wiki/File:Bulguksa_temple_entrance_gate_stairs_flower_bed_and_blue_sky_in_Gyeongju_South_Korea.jpg'
        },
        {
          name: 'Incheon', type: 'City', continent: 'Asia', country: 'South Korea', countryCode: 'KR',
          lat: 37.4563, lon: 126.7052,
          description: 'Explore the historic port, Chinatown, and the modern Songdo waterfront.',
          articleUrl: 'https://en.wikipedia.org/wiki/Incheon',
          image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/South_Korea%2C_Incheon%2C_Songdo%2C_the_Sharp_Central_Park_Towers.jpg/960px-South_Korea%2C_Incheon%2C_Songdo%2C_the_Sharp_Central_Park_Towers.jpg',
          imageAlt: 'Songdo Central Park towers in Incheon',
          creditUrl: 'https://commons.wikimedia.org/wiki/File:South_Korea,_Incheon,_Songdo,_the_Sharp_Central_Park_Towers.jpg'
        },
        {
          name: 'Suwon', type: 'City', continent: 'Asia', country: 'South Korea', countryCode: 'KR',
          lat: 37.2636, lon: 127.0286,
          description: 'Visit Hwaseong Fortress and the historic center just south of Seoul.',
          articleUrl: 'https://en.wikipedia.org/wiki/Suwon',
          image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Hwaseong_Fortress_01.jpg/960px-Hwaseong_Fortress_01.jpg',
          imageAlt: 'Stone walls and buildings of Hwaseong Fortress in Suwon',
          creditUrl: 'https://commons.wikimedia.org/wiki/File:Hwaseong_Fortress_01.jpg'
        }
      ];

      function findDestinationMatches(query) {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        if (!normalizedQuery) return [];
        const mentionsKorea = /\b(south korea|korea|korean)\b/.test(normalizedQuery);
        const asksForPlaces = /\b(place|places|popular|visit|travel|destination|destinations|attraction|attractions|things to do|guide|guides|tourism)\b/.test(normalizedQuery);
        const directKoreaSearch = /^(south korea|korea|south korean|korean places)$/.test(normalizedQuery);
        if (!mentionsKorea || (!asksForPlaces && !directKoreaSearch)) return [];

        const placeTerms = normalizedQuery
          .replace(/\b(most|popular|best|top|places?|in|the|south|korea|korean|visit|travel|destinations?|attractions?|things to do|guide|guides|tourism)\b/g, ' ')
          .trim();
        if (!placeTerms) return destinationGuides;
        return destinationGuides.filter((place) =>
          `${place.name} ${place.description}`.toLocaleLowerCase().includes(placeTerms)
        );
      }

      document.querySelectorAll('[data-explore-feature]').forEach((tile) => {
        const featureId = tile.dataset.exploreFeature;
        const feature = featureCollections[featureId];
        if (!feature) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', `Explore ${feature.title} in ${feature.location}`);

        const image = document.createElement('img');
        image.src = feature.images[0].src;
        image.alt = feature.images[0].alt;
        image.loading = 'lazy';

        const copy = document.createElement('span');
        copy.className = 'explore-highlight-copy';
        const title = document.createElement('strong');
        title.textContent = feature.title;
        const location = document.createElement('span');
        location.textContent = feature.location;
        copy.append(title, location);
        button.append(image, copy);
        button.addEventListener('click', () => openFeature(featureId));
        tile.append(button);
      });

      const featureDialog = document.getElementById('featureDialog');
      const saveFeatureButton = document.getElementById('saveFeature');
      const savedFeatures = new Set();
      const savedFeaturesStorageKey = 'find-hub-saved-collections';
      const portfolioProjectsStorageKey = 'find-hub-portfolio-projects';
      const personalProjectsStorageKey = 'find-hub-personal-projects';
      const creatorProfileStorageKey = 'find-hub-creator-profile';
      const portfolioProjectIds = new Set();
      const personalProjectIds = new Set();
      let creatorProfile = { name: '', bio: '' };
      try {
        const storedFeatures = JSON.parse(localStorage.getItem(savedFeaturesStorageKey) || '[]');
        if (Array.isArray(storedFeatures)) {
          storedFeatures.filter((featureId) => featureCollections[featureId]).forEach((featureId) => savedFeatures.add(featureId));
        }
      } catch {}
      try {
        const personalProjects = JSON.parse(localStorage.getItem(personalProjectsStorageKey) || '[]');
        let migratedStarterTitle = false;
        if (Array.isArray(personalProjects)) {
          personalProjects.forEach((project) => {
            if (!project?.id || !project.title || !project.images?.length) return;
            if (project.id === 'find-hub-discovery-concept' && project.title === 'Find Hub - World Discovery') {
              project.title = 'Worldloom - World Discovery';
              migratedStarterTitle = true;
            }
            featureCollections[project.id] = { ...project, personal: true, place: null };
            personalProjectIds.add(project.id);
          });
          if (migratedStarterTitle) {
            localStorage.setItem(personalProjectsStorageKey, JSON.stringify(personalProjects));
          }
        }
        const savedFeatureIds = JSON.parse(localStorage.getItem(savedFeaturesStorageKey) || '[]');
        if (Array.isArray(savedFeatureIds)) {
          savedFeatureIds.filter((featureId) => personalProjectIds.has(featureId)).forEach((featureId) => savedFeatures.add(featureId));
        }
        const storedProjects = JSON.parse(localStorage.getItem(portfolioProjectsStorageKey) || '[]');
        if (Array.isArray(storedProjects)) {
          storedProjects.filter((featureId) => featureCollections[featureId]).forEach((featureId) => portfolioProjectIds.add(featureId));
        }
        const storedProfile = JSON.parse(localStorage.getItem(creatorProfileStorageKey) || '{}');
        creatorProfile = {
          name: typeof storedProfile.name === 'string' ? storedProfile.name : '',
          bio: typeof storedProfile.bio === 'string' ? storedProfile.bio : ''
        };
      } catch {}
      const portfolioStarterKey = 'find-hub-portfolio-starter-added';
      const worldloomProjectId = 'find-hub-discovery-concept';
      try {
        if (localStorage.getItem(portfolioStarterKey) !== 'true') {
          const worldloomProject = {
            id: worldloomProjectId,
            title: 'Worldloom - World Discovery',
            group: 'Interface design',
            category: 'Digital product concept',
            description: 'A world discovery concept with an interactive globe, location search, curated collections, and creator portfolio tools.',
            location: 'Global',
            place: null,
            images: [{
              src: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1200&q=85',
              alt: 'Earth viewed from space'
            }],
            personal: true
          };
          featureCollections[worldloomProjectId] = worldloomProject;
          personalProjectIds.add(worldloomProjectId);
          portfolioProjectIds.add(worldloomProjectId);
          localStorage.setItem(personalProjectsStorageKey, JSON.stringify(
            [...personalProjectIds].map((id) => featureCollections[id]).filter(Boolean)
          ));
          localStorage.setItem(portfolioProjectsStorageKey, JSON.stringify([...portfolioProjectIds]));
          localStorage.setItem(portfolioStarterKey, 'true');
        }
      } catch {}
      const featureOpenCountsStorageKey = 'find-hub-feature-open-counts';
      const featureOpenCounts = new Map();
      try {
        const storedOpenCounts = JSON.parse(localStorage.getItem(featureOpenCountsStorageKey) || '{}');
        Object.entries(storedOpenCounts).forEach(([featureId, count]) => {
          if (Number.isFinite(count) && count > 0) featureOpenCounts.set(featureId, Math.floor(count));
        });
      } catch {}

      function renderFeatureMetrics() {
        const totalOpens = [...featureOpenCounts.values()].reduce((total, count) => total + count, 0);
        document.querySelectorAll('[data-feature-opens]').forEach((element) => {
          const count = featureOpenCounts.get(element.dataset.featureOpens) || 0;
          element.textContent = `${count} ${count === 1 ? 'open' : 'opens'}`;
        });
        document.querySelectorAll('[data-feature-share]').forEach((element) => {
          const count = featureOpenCounts.get(element.dataset.featureShare) || 0;
          element.textContent = `${totalOpens ? Math.round(count / totalOpens * 100) : 0}%`;
        });

        const highlightGroups = {
          'urban-design': ['Spaces & design'],
          'food-culture': ['Food & culture'],
          'architectural-tours': ['Architecture & ideas']
        };
        document.querySelectorAll('[data-highlight-share]').forEach((element) => {
          const groups = highlightGroups[element.dataset.highlightShare] || [];
          const count = [...featureOpenCounts.entries()].reduce((total, [featureId, opens]) => {
            return total + (groups.includes(featureCollections[featureId]?.category) ? opens : 0);
          }, 0);
          element.textContent = `${totalOpens ? Math.round(count / totalOpens * 100) : 0}%`;
        });
      }

      function recordFeatureOpen(featureId) {
        featureOpenCounts.set(featureId, (featureOpenCounts.get(featureId) || 0) + 1);
        try {
          localStorage.setItem(featureOpenCountsStorageKey, JSON.stringify(Object.fromEntries(featureOpenCounts)));
        } catch {}
        renderFeatureMetrics();
      }

      renderFeatureMetrics();
      const collectionGrid = document.getElementById('collectionGrid');
      const collectionSearch = document.getElementById('collectionSearch');
      const portfolioProjects = document.getElementById('portfolioProjects');
      const creatorNameInput = document.getElementById('creatorName');
      const creatorBioInput = document.getElementById('creatorBio');
      const exploreSearch = document.getElementById('exploreSearch');
      const exploreSearchForm = document.getElementById('exploreSearchForm');
      const exploreSearchActions = document.getElementById('exploreSearchActions');
      const collectionSearchActions = document.getElementById('collectionSearchActions');
      const searchQueryLabel = document.getElementById('searchQueryLabel');
      const guideResults = document.getElementById('guideResults');
      const guideResultsHeading = document.getElementById('guideResultsHeading');
      const guideSearchStatus = document.getElementById('guideSearchStatus');
      const worldGuideCache = new Map();
      let worldGuideSearchId = 0;
      let worldGuideController = null;
      const collectionFilters = document.querySelectorAll('[data-collection-category]');
      collectionFilters.forEach((filter) => {
        const category = filter.dataset.collectionCategory;
        if (category === 'All') return;

        const example = Object.values(featureCollections).find((feature) => feature.group === category);
        if (!example?.images?.length) return;

        const preview = document.createElement('img');
        preview.className = 'collection-filter-preview';
        preview.src = example.images[0].src;
        preview.alt = '';
        preview.loading = 'lazy';
        preview.onerror = () => { preview.hidden = true; };

        const copy = document.createElement('span');
        copy.className = 'collection-filter-copy';
        const label = document.createElement('strong');
        label.textContent = category;
        const title = document.createElement('small');
        title.textContent = example.title;
        copy.append(label, title);
        filter.replaceChildren(preview, copy);
        filter.setAttribute('aria-label', `${category} collections, such as ${example.title}`);
      });
      const topicButtons = document.querySelectorAll('[data-topic]');
      const topicGroups = {
        Design: ['Spaces', 'Architecture'],
        Places: ['Cities', 'Nature', 'Travel', 'Food & culture'],
        Ideas: ['Spaces', 'Architecture', 'Art'],
        Culture: ['Food & culture', 'Art', 'Cities'],
        Travel: ['Travel', 'Nature', 'Cities'],
        Art: ['Art', 'Architecture']
      };
      let activeFeature = null;
      let activeFeatureId = null;
      let activeCollectionCategory = 'All';
      let activeTopicFilter = null;
      let showingSavedOnly = false;
      let activeSlideIndex = 0;
      let slideshowTimer = null;
      let slideshowPaused = false;

      function updateExploreSearchActions() {
        exploreSearchActions.hidden = true;
        clearSearchResults();
      }

      exploreSearch.addEventListener('input', updateExploreSearchActions);
      exploreSearchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = exploreSearch.value.trim();
        if (!query) return;
        showCollections(false);
        collectionSearch.value = query;
        renderCollections();
        searchWorldGuide(query);
      });

      document.querySelectorAll('[data-explore-query]').forEach((button) => {
        button.addEventListener('click', () => {
          exploreSearch.value = button.dataset.exploreQuery;
          exploreSearchForm.requestSubmit();
        });
      });

      function updateCollectionSearchActions() {
        const query = collectionSearch.value.trim();
        collectionSearchActions.hidden = true;
        if (!query) return;

        searchQueryLabel.textContent = `Optional external search for "${query}":`;
        document.getElementById('searchQueryGoogle').href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        document.getElementById('searchQueryYouTube').href = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      }

      function clearWorldGuideResults() {
        worldGuideController?.abort();
        worldGuideSearchId += 1;
        guideResults.replaceChildren();
        guideResultsHeading.hidden = true;
        guideSearchStatus.hidden = true;
        guideSearchStatus.textContent = '';
      }

      function clearSearchResults() {
        clearWorldGuideResults();
        collectionGrid.replaceChildren();
        document.getElementById('destinationResultsHeading').hidden = true;
        collectionSearchActions.hidden = true;
      }

      function renderWorldGuideResults(pages, query, travelQuery) {
        guideResults.replaceChildren();
        const illustratedPages = pages.filter((page) => page.thumbnail?.source);
        const guideType = travelQuery ? 'travel and guide' : 'guide';
        illustratedPages.forEach((page) => {
          const tile = document.createElement('article');
          tile.className = 'destination-result';
          const guideLink = document.createElement('a');
          guideLink.className = 'destination-result-link';
          guideLink.href = page.fullurl || `https://${page.source === 'Wikivoyage' ? 'en.wikivoyage.org' : 'en.wikipedia.org'}/wiki/${encodeURIComponent(page.title.replaceAll(' ', '_'))}`;
          guideLink.target = '_blank';
          guideLink.rel = 'noopener noreferrer';

          const image = document.createElement('img');
          image.src = page.thumbnail.source;
          image.alt = `Photo related to ${page.title}`;
          image.loading = 'lazy';
          image.onerror = () => {
            tile.remove();
            const remaining = guideResults.querySelectorAll('.destination-result').length;
            guideSearchStatus.textContent = remaining
              ? `${remaining} illustrated in-app ${guideType} ${remaining === 1 ? 'result' : 'results'}`
              : `No in-app ${guideType} results with images for "${query}". Try a shorter or more specific search.`;
          };
          guideLink.append(image);

          const copy = document.createElement('div');
          copy.className = 'destination-result-copy';
          const category = document.createElement('span');
          category.className = 'collection-category';
          category.textContent = 'World guide';
          const title = document.createElement('strong');
          title.textContent = page.title;
          const summary = document.createElement('p');
          summary.textContent = page.extract || 'Explore this topic in the World guide.';
          const source = document.createElement('span');
          source.className = 'destination-result-credit';
          source.textContent = `Source: ${page.source}`;
          copy.append(category, title, summary, source);
          guideLink.append(copy);
          tile.append(guideLink);

          const coordinates = page.coordinates?.[0];
          if (coordinates && Number.isFinite(coordinates.lat) && Number.isFinite(coordinates.lon)) {
            const action = document.createElement('div');
            action.className = 'destination-result-action';
            const mapButton = document.createElement('button');
            mapButton.type = 'button';
            mapButton.className = 'btn primary';
            mapButton.textContent = 'Show on map';
            mapButton.addEventListener('click', () => {
              showMap();
              selectLocation({
                name: page.title,
                type: 'Guide result',
                continent: 'World',
                lat: coordinates.lat,
                lon: coordinates.lon
              });
            });
            action.append(mapButton);
            tile.append(action);
          }

          guideResults.append(tile);
        });
        return illustratedPages.length;
      }

      function isTravelGuideQuery(query) {
        return /\b(travel|tour|tourism|visit|destination|destinations|place|places|attraction|attractions|things to do|sightseeing|holiday|vacation)\b/i.test(query);
      }

      async function fetchGuidePages(source, query, signal) {
        const params = new URLSearchParams({
          action: 'query',
          generator: 'search',
          gsrsearch: query,
          gsrnamespace: '0',
          gsrlimit: '7',
          prop: 'pageimages|extracts|coordinates|info',
          inprop: 'url',
          exintro: '1',
          explaintext: '1',
          exsentences: '3',
          piprop: 'thumbnail',
          pithumbsize: '720',
          colimit: 'max',
          format: 'json',
          origin: '*'
        });
        const response = await fetch(`https://${source.domain}/w/api.php?${params}`, { signal });
        if (!response.ok) throw new Error(`${source.name} search is unavailable`);
        const data = await response.json();
        return Object.values(data.query?.pages || {})
          .sort((first, second) => first.index - second.index)
          .filter((page) => page.extract && page.thumbnail?.source)
          .map((page) => ({ ...page, source: source.name }));
      }

      async function searchWorldGuide(query) {
        const normalizedQuery = query.trim();
        if (!normalizedQuery) return;
        clearWorldGuideResults();
        const searchId = worldGuideSearchId;
        const cacheKey = normalizedQuery.toLocaleLowerCase();
        updateCollectionSearchActions();
        collectionSearchActions.hidden = false;
        guideResultsHeading.hidden = false;
        guideSearchStatus.hidden = false;
        const travelQuery = isTravelGuideQuery(normalizedQuery);
        guideSearchStatus.textContent = travelQuery
          ? `Finding travel guides and local results for "${normalizedQuery}"…`
          : `Finding places, food, art, and more for "${normalizedQuery}"…`;
        worldGuideController = new AbortController();

        try {
          let pages = worldGuideCache.get(cacheKey);
          if (!pages) {
            const sources = travelQuery
              ? [{ name: 'Wikivoyage', domain: 'en.wikivoyage.org' }, { name: 'Wikipedia', domain: 'en.wikipedia.org' }]
              : [{ name: 'Wikipedia', domain: 'en.wikipedia.org' }];
            const sourceResults = await Promise.allSettled(sources.map((source) =>
              fetchGuidePages(source, normalizedQuery, worldGuideController.signal)
            ));
            const successfulSources = sourceResults
              .filter((result) => result.status === 'fulfilled')
              .map((result) => result.value)
              .filter((sourcePages) => sourcePages.length > 0);
            const preferredSource = travelQuery ? 'Wikivoyage' : 'Wikipedia';
            const preferredPages = successfulSources.find((sourcePages) => sourcePages[0]?.source === preferredSource) || [];
            const fallbackPages = successfulSources.find((sourcePages) => sourcePages[0]?.source !== preferredSource) || [];
            pages = (preferredPages.length ? preferredPages : fallbackPages)
              .filter((page, index, allPages) => allPages.findIndex((candidate) =>
                candidate.title.toLocaleLowerCase() === page.title.toLocaleLowerCase()
              ) === index)
              .slice(0, 9);
            if (!sourceResults.some((result) => result.status === 'fulfilled')) {
              throw new Error('Guide search is unavailable');
            }
            worldGuideCache.set(cacheKey, pages);
          }

          if (searchId !== worldGuideSearchId) return;
          const resultCount = renderWorldGuideResults(pages, normalizedQuery, travelQuery);
          const guideType = travelQuery ? 'travel and guide' : 'guide';
          guideSearchStatus.textContent = resultCount
            ? `${resultCount} illustrated in-app ${guideType} ${resultCount === 1 ? 'result' : 'results'}`
            : `No in-app ${guideType} results with images for "${normalizedQuery}". Try a shorter or more specific search.`;
        } catch (error) {
          if (searchId !== worldGuideSearchId || error.name === 'AbortError') return;
          guideSearchStatus.textContent = 'The World guide could not load right now. Your collections are still available below.';
        }
      }

      function renderCollections() {
        clearWorldGuideResults();
        updateCollectionSearchActions();
        const rawQuery = collectionSearch.value.trim();
        const query = rawQuery.toLocaleLowerCase();
        collectionGrid.replaceChildren();
        const destinationMatches = showingSavedOnly || activeCollectionCategory !== 'All' || activeTopicFilter
          ? []
          : findDestinationMatches(rawQuery).filter((place) => place.image);
        const destinationResultsHeading = document.getElementById('destinationResultsHeading');
        destinationResultsHeading.hidden = destinationMatches.length === 0;
        destinationResultsHeading.textContent = destinationMatches.length ? 'Curated destinations in South Korea' : '';

        const matches = Object.entries(featureCollections).filter(([featureId, feature]) => {
          if (feature.personal) return false;
          const matchesCategory = activeCollectionCategory === 'All' || feature.group === activeCollectionCategory;
          const matchesTopic = !activeTopicFilter || topicGroups[activeTopicFilter].includes(feature.group);
          const matchesSaved = !showingSavedOnly || savedFeatures.has(featureId);
          const searchableText = `${feature.title} ${feature.category} ${feature.description} ${feature.location}`.toLocaleLowerCase();
          return matchesCategory && matchesTopic && matchesSaved && searchableText.includes(query)
            && feature.images?.[0]?.src;
        });

        if (matches.length === 0 && destinationMatches.length === 0) {
          if (query && !showingSavedOnly) return;
          const empty = document.createElement('div');
          empty.className = 'collection-empty';
          empty.textContent = showingSavedOnly
            ? query ? 'No saved collection matches.' : 'No saved collections yet.'
            : query ? 'No matching collection. Press Enter to search the World guide.' : 'No collections match those filters.';
          collectionGrid.append(empty);
          return;
        }

        destinationMatches.forEach((place) => {
          const tile = document.createElement('article');
          tile.className = 'destination-result';

          const image = document.createElement('img');
          image.src = place.image;
          image.alt = place.imageAlt;
          image.loading = 'lazy';
          image.onerror = () => {
            tile.remove();
            if (!collectionGrid.querySelector('.destination-result')) destinationResultsHeading.hidden = true;
          };
          const guideLink = document.createElement('a');
          guideLink.className = 'destination-result-link';
          guideLink.href = place.articleUrl;
          guideLink.target = '_blank';
          guideLink.rel = 'noopener noreferrer';
          guideLink.append(image);

          const copy = document.createElement('div');
          copy.className = 'destination-result-copy';
          const category = document.createElement('span');
          category.className = 'collection-category';
          category.textContent = place.type;
          const title = document.createElement('strong');
          title.textContent = place.name;
          const location = document.createElement('p');
          location.textContent = place.description;
          const credit = document.createElement('a');
          credit.className = 'destination-result-credit';
          credit.href = place.creditUrl;
          credit.target = '_blank';
          credit.rel = 'noopener noreferrer';
          credit.textContent = 'Photo: Wikimedia Commons';
          copy.append(category, title, location);
          guideLink.append(copy);
          const photoCredit = document.createElement('div');
          photoCredit.className = 'destination-result-copy';
          photoCredit.append(credit);

          const mapButton = document.createElement('button');
          mapButton.type = 'button';
          mapButton.className = 'btn primary';
          mapButton.textContent = 'Show on map';
          mapButton.addEventListener('click', () => {
            showMap();
            selectLocation(place);
          });

          const action = document.createElement('div');
          action.className = 'destination-result-action';
          action.append(mapButton);
          tile.append(guideLink, photoCredit, action);
          collectionGrid.append(tile);
        });

        matches.forEach(([featureId, feature]) => {
          const tile = document.createElement('article');
          tile.className = 'collection-tile';

          const openButton = document.createElement('button');
          openButton.type = 'button';
          openButton.className = 'collection-open';
          openButton.setAttribute('aria-label', `Open ${feature.title} collection`);

          const image = document.createElement('img');
          image.className = 'collection-cover';
          image.src = feature.images[0].src;
          image.alt = feature.images[0].alt;
          image.loading = 'lazy';
          image.onerror = () => { tile.remove(); };

          const copy = document.createElement('span');
          copy.className = 'collection-copy';
          const category = document.createElement('span');
          category.className = 'collection-category';
          category.textContent = feature.group;
          const title = document.createElement('strong');
          title.textContent = feature.title;
          const location = document.createElement('span');
          location.textContent = feature.location;
          copy.append(category, title, location);
          openButton.append(image, copy);
          openButton.addEventListener('click', () => openFeature(featureId));

          const footer = document.createElement('div');
          footer.className = 'collection-tile-footer';
          const count = document.createElement('span');
          count.className = 'collection-slide-count';
          count.textContent = `${feature.images.length} ${feature.images.length === 1 ? 'photo' : 'photos'}`;
          const saveButton = document.createElement('button');
          saveButton.type = 'button';
          saveButton.className = 'collection-save';
          saveButton.setAttribute('aria-pressed', String(savedFeatures.has(featureId)));
          saveButton.textContent = savedFeatures.has(featureId) ? 'Saved' : 'Save';
          saveButton.addEventListener('click', () => {
            toggleSavedFeature(featureId);
          });
          const portfolioButton = document.createElement('button');
          portfolioButton.type = 'button';
          portfolioButton.className = 'portfolio-toggle';
          portfolioButton.setAttribute('aria-pressed', String(portfolioProjectIds.has(featureId)));
          portfolioButton.textContent = portfolioProjectIds.has(featureId) ? 'In portfolio' : 'Feature';
          portfolioButton.addEventListener('click', () => togglePortfolioProject(featureId));
          footer.append(count, saveButton, portfolioButton);
          tile.append(openButton, footer);
          collectionGrid.append(tile);
        });
      }

      function renderPortfolio() {
        const displayName = creatorProfile.name.trim();
        document.getElementById('portfolioHeading').textContent = displayName ? `${displayName}'s portfolio` : 'Your portfolio';
        document.getElementById('portfolioBioPreview').textContent = creatorProfile.bio.trim()
          || 'Add your name and a short introduction, then feature collections that reflect what you love exploring.';
        creatorNameInput.value = creatorProfile.name;
        creatorBioInput.value = creatorProfile.bio;
        portfolioProjects.replaceChildren();

        const projects = [...portfolioProjectIds].filter((featureId) => featureCollections[featureId]);
        if (projects.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'collection-empty';
          empty.textContent = 'Your portfolio is ready for your first project. Upload your own work or feature a curated collection.';
          portfolioProjects.append(empty);
          return;
        }

        projects.forEach((featureId) => {
          const feature = featureCollections[featureId];
          const tile = document.createElement('article');
          tile.className = 'collection-tile';
          const openButton = document.createElement('button');
          openButton.type = 'button';
          openButton.className = 'collection-open';
          openButton.setAttribute('aria-label', `Open portfolio project ${feature.title}`);
          const image = document.createElement('img');
          image.className = 'collection-cover';
          image.src = feature.images[0].src;
          image.alt = feature.images[0].alt;
          const copy = document.createElement('span');
          copy.className = 'collection-copy';
          const category = document.createElement('span');
          category.className = 'collection-category';
          category.textContent = feature.personal ? 'Your work' : feature.group;
          const title = document.createElement('strong');
          title.textContent = feature.title;
          const location = document.createElement('span');
          location.textContent = feature.location || 'Personal project';
          copy.append(category, title, location);
          openButton.append(image, copy);
          openButton.addEventListener('click', () => openFeature(featureId));

          const footer = document.createElement('div');
          footer.className = 'collection-tile-footer';
          const photoCount = document.createElement('span');
          photoCount.className = 'collection-slide-count';
          photoCount.textContent = `${feature.images.length} ${feature.images.length === 1 ? 'photo' : 'photos'}`;
          const removeButton = document.createElement('button');
          removeButton.type = 'button';
          removeButton.className = 'portfolio-toggle';
          removeButton.textContent = 'Remove';
          removeButton.setAttribute('aria-label', `Remove ${feature.title} from portfolio`);
          removeButton.addEventListener('click', () => removePortfolioProject(featureId));
          footer.append(photoCount, removeButton);
          tile.append(openButton, footer);
          portfolioProjects.append(tile);
        });
      }

      function togglePortfolioProject(featureId) {
        if (portfolioProjectIds.has(featureId)) {
          portfolioProjectIds.delete(featureId);
        } else {
          portfolioProjectIds.add(featureId);
        }
        try {
          localStorage.setItem(portfolioProjectsStorageKey, JSON.stringify([...portfolioProjectIds]));
        } catch {}
        renderCollections();
        if (portfolioPage.classList.contains('active')) renderPortfolio();
      }

      function removePortfolioProject(featureId) {
        portfolioProjectIds.delete(featureId);
        if (personalProjectIds.has(featureId)) {
          personalProjectIds.delete(featureId);
          delete featureCollections[featureId];
          try {
            localStorage.setItem(personalProjectsStorageKey, JSON.stringify(
              [...personalProjectIds].map((id) => featureCollections[id]).filter(Boolean)
            ));
          } catch {}
        }
        try {
          localStorage.setItem(portfolioProjectsStorageKey, JSON.stringify([...portfolioProjectIds]));
        } catch {}
        renderPortfolio();
      }

      function showPortfolio() {
        showPage(portfolioPage, navPortfolioButton);
        renderPortfolio();
      }

      document.getElementById('creatorProfileForm').addEventListener('submit', (event) => {
        event.preventDefault();
        creatorProfile = { name: creatorNameInput.value.trim(), bio: creatorBioInput.value.trim() };
        try {
          localStorage.setItem(creatorProfileStorageKey, JSON.stringify(creatorProfile));
        } catch {}
        renderPortfolio();
      });

      function compressProjectImage(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error('Could not read this image.'));
          reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error('This image could not be opened.'));
            image.onload = () => {
              const maxDimension = 1400;
              const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
              const canvas = document.createElement('canvas');
              canvas.width = Math.round(image.width * scale);
              canvas.height = Math.round(image.height * scale);
              const context = canvas.getContext('2d');
              context.fillStyle = '#ffffff';
              context.fillRect(0, 0, canvas.width, canvas.height);
              context.drawImage(image, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.82));
            };
            image.src = reader.result;
          };
          reader.readAsDataURL(file);
        });
      }

      document.getElementById('portfolioProjectForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const status = document.getElementById('portfolioFormStatus');
        const submitButton = form.querySelector('button[type="submit"]');
        const file = document.getElementById('projectImageInput').files[0];
        if (!file || !file.type.startsWith('image/')) {
          status.textContent = 'Choose an image file to add your project.';
          return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Preparing image...';
        status.textContent = '';

        try {
          const imageSrc = await compressProjectImage(file);
          const title = document.getElementById('projectTitleInput').value.trim();
          const location = document.getElementById('projectLocationInput').value.trim();
          const description = document.getElementById('projectDescriptionInput').value.trim();
          const normalizedLocation = location.toLocaleLowerCase();
          const place = locations.find((item) => item.name.toLocaleLowerCase() === normalizedLocation)
            || Object.values(featureCollections).find((item) => item.location?.toLocaleLowerCase() === normalizedLocation)?.place
            || null;
          const project = {
            id: `personal-${Date.now()}`,
            title,
            group: 'Your work',
            category: 'Portfolio project',
            description: description || 'A project from my portfolio.',
            location,
            place,
            images: [{ src: imageSrc, alt: title }]
          };

          featureCollections[project.id] = { ...project, personal: true };
          personalProjectIds.add(project.id);
          portfolioProjectIds.add(project.id);
          localStorage.setItem(personalProjectsStorageKey, JSON.stringify(
            [...personalProjectIds].map((id) => featureCollections[id]).filter(Boolean)
          ));
          localStorage.setItem(portfolioProjectsStorageKey, JSON.stringify([...portfolioProjectIds]));
          form.reset();
          status.textContent = 'Your project is now in your portfolio.';
          renderPortfolio();
        } catch (error) {
          status.textContent = error.name === 'QuotaExceededError'
            ? 'This image exceeds the browser storage available. Try a smaller image.'
            : error.message || 'Could not save this project.';
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = 'Add project';
        }
      });

      function showCollections(savedOnly) {
        showingSavedOnly = savedOnly;
        activeTopicFilter = null;
        activeCollectionCategory = 'All';
        collectionSearch.value = '';
        topicButtons.forEach((button) => {
          button.classList.remove('active');
          button.setAttribute('aria-pressed', 'false');
        });
        collectionFilters.forEach((filter) => filter.classList.toggle('active', filter.dataset.collectionCategory === 'All'));
        document.getElementById('collectionsTitle').textContent = savedOnly ? 'Saved collections' : 'Collections';
        document.getElementById('collectionsDescription').textContent = savedOnly
          ? 'Your saved spaces, city guides, and places.'
          : 'Explore spaces, cities, architecture, art, and places worth discovering.';
        showPage(collectionsPage, savedOnly ? navSavedButton : navCollectionsButton);
        renderCollections();
      }

      topicButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const topic = button.dataset.topic;
          showingSavedOnly = false;
          activeTopicFilter = topic;
          activeCollectionCategory = 'All';
          collectionSearch.value = '';
          topicButtons.forEach((item) => {
            const selected = item === button;
            item.classList.toggle('active', selected);
            item.setAttribute('aria-pressed', String(selected));
          });
          collectionFilters.forEach((filter) => filter.classList.toggle('active', filter.dataset.collectionCategory === 'All'));
          document.getElementById('collectionsTitle').textContent = `${topic} collections`;
          document.getElementById('collectionsDescription').textContent = `Explore curated ${topic.toLocaleLowerCase()} ideas, places, and inspiration.`;
          showPage(collectionsPage, navCollectionsButton);
          renderCollections();
        });
      });

      function toggleSavedFeature(featureId) {
        if (savedFeatures.has(featureId)) {
          savedFeatures.delete(featureId);
        } else {
          savedFeatures.add(featureId);
        }
        try {
          localStorage.setItem(savedFeaturesStorageKey, JSON.stringify([...savedFeatures]));
        } catch {}
        if (collectionsPage.classList.contains('active')) renderCollections();
      }

      collectionFilters.forEach((filter) => {
        filter.addEventListener('click', () => {
          activeCollectionCategory = filter.dataset.collectionCategory;
          collectionFilters.forEach((item) => item.classList.toggle('active', item === filter));
          renderCollections();
        });
      });
      collectionSearch.addEventListener('input', clearSearchResults);
      collectionSearch.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        renderCollections();
        searchWorldGuide(collectionSearch.value);
      });

      function showFeatureSlide(index) {
        if (!activeFeature) return;
        activeSlideIndex = (index + activeFeature.images.length) % activeFeature.images.length;
        const slide = activeFeature.images[activeSlideIndex];
        const image = document.getElementById('dialogImage');
        image.classList.add('is-changing');
        image.onload = () => image.classList.remove('is-changing');
        image.onerror = () => image.classList.remove('is-changing');
        image.src = slide.src;
        image.alt = slide.alt;
        document.getElementById('galleryCount').textContent = `${activeSlideIndex + 1} / ${activeFeature.images.length}`;
      }

      function stopSlideshow() {
        window.clearInterval(slideshowTimer);
        slideshowTimer = null;
      }

      function startSlideshow() {
        stopSlideshow();
        slideshowPaused = false;
        const toggleButton = document.getElementById('toggleSlideshow');
        toggleButton.textContent = 'Pause';
        toggleButton.setAttribute('aria-label', 'Pause slideshow');
        toggleButton.title = 'Pause slideshow';
        slideshowTimer = window.setInterval(() => showFeatureSlide(activeSlideIndex + 1), 3200);
      }

      function openFeature(card) {
        activeFeatureId = typeof card === 'string' ? card : card.dataset.feature;
        activeFeature = featureCollections[activeFeatureId];
        if (!activeFeature) return;
        recordFeatureOpen(activeFeatureId);

        const featuredSearch = `${activeFeature.title} ${activeFeature.location || ''}`.trim();
        document.getElementById('searchFeatureGoogle').href = `https://www.google.com/search?q=${encodeURIComponent(featuredSearch)}`;
        document.getElementById('searchFeatureYouTube').href = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${featuredSearch} tour`)}`;
        document.getElementById('showFeatureOnMap').hidden = !activeFeature.place;
        activeSlideIndex = 0;
        showFeatureSlide(activeSlideIndex);
        document.getElementById('dialogCategory').textContent = activeFeature.category;
        document.getElementById('dialogTitle').textContent = activeFeature.title;
        document.getElementById('dialogDescription').textContent = activeFeature.description;
        document.getElementById('dialogLocation').textContent = activeFeature.location;
        const isSaved = savedFeatures.has(activeFeatureId);
        saveFeatureButton.setAttribute('aria-pressed', String(isSaved));
        saveFeatureButton.textContent = isSaved ? 'Saved' : 'Save collection';
        featureDialog.showModal();
        startSlideshow();
      }

      const popularDialog = document.getElementById('popularDialog');
      const popularOptions = document.getElementById('popularOptions');

      function openPopularOptions(button) {
        const suggestedFeature = button.dataset.popular;
        const popularName = button.querySelector('.strong-label').textContent;
        document.getElementById('popularDialogTitle').textContent = popularName;
        document.getElementById('popularDialogDescription').textContent = 'Browse this pick or explore another collection.';
        popularOptions.replaceChildren();

        Object.entries(featureCollections)
          .sort(([firstId], [secondId]) => Number(secondId === suggestedFeature) - Number(firstId === suggestedFeature))
          .forEach(([featureId, feature]) => {
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'popular-option';
            option.setAttribute('aria-label', `Open ${feature.title} collection`);

            const image = document.createElement('img');
            image.src = feature.images[0].src;
            image.alt = '';

            const copy = document.createElement('span');
            copy.className = 'popular-option-copy';
            const title = document.createElement('strong');
            title.textContent = feature.title;
            const location = document.createElement('span');
            location.textContent = feature.location;
            copy.append(title, location);

            if (featureId === suggestedFeature) {
              const suggestion = document.createElement('em');
              suggestion.textContent = 'Suggested for this pick';
              copy.append(suggestion);
            }

            option.append(image, copy);
            option.addEventListener('click', () => {
              popularDialog.close();
              openFeature(featureId);
            });
            popularOptions.append(option);
          });

        popularDialog.showModal();
      }

      document.querySelectorAll('[data-popular]').forEach((button) => {
        button.addEventListener('click', () => openPopularOptions(button));
      });

      document.getElementById('closePopularDialog').addEventListener('click', () => popularDialog.close());
      popularDialog.addEventListener('click', (event) => {
        if (event.target === popularDialog) popularDialog.close();
      });

      document.querySelectorAll('[data-feature]').forEach((card) => {
        card.addEventListener('click', () => openFeature(card));
        card.querySelector('.youtube-link')?.addEventListener('click', (event) => {
          event.stopPropagation();
        });
      });

      document.getElementById('closeFeatureDialog').addEventListener('click', () => featureDialog.close());
      featureDialog.addEventListener('close', stopSlideshow);
      featureDialog.addEventListener('click', (event) => {
        if (event.target === featureDialog) featureDialog.close();
      });

      document.getElementById('previousSlide').addEventListener('click', () => showFeatureSlide(activeSlideIndex - 1));
      document.getElementById('nextSlide').addEventListener('click', () => showFeatureSlide(activeSlideIndex + 1));
      document.getElementById('toggleSlideshow').addEventListener('click', (event) => {
        slideshowPaused = !slideshowPaused;
        if (slideshowPaused) {
          stopSlideshow();
          event.currentTarget.textContent = 'Play';
          event.currentTarget.setAttribute('aria-label', 'Resume slideshow');
          event.currentTarget.title = 'Resume slideshow';
        } else {
          startSlideshow();
        }
      });

      saveFeatureButton.addEventListener('click', () => {
        if (!activeFeatureId) return;
        toggleSavedFeature(activeFeatureId);
        saveFeatureButton.setAttribute('aria-pressed', String(savedFeatures.has(activeFeatureId)));
        saveFeatureButton.textContent = savedFeatures.has(activeFeatureId) ? 'Saved' : 'Save collection';
      });

      document.getElementById('showFeatureOnMap').addEventListener('click', () => {
        if (!activeFeature) return;
        featureDialog.close();
        showMap();
        updateNav(navMapButton);
        selectLocation(activeFeature.place);
      });

      document.getElementById('locateMe').addEventListener('click', () => {
        if (!navigator.geolocation) {
          document.getElementById('selectedLocationName').textContent = 'Location unavailable';
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async ({ coords }) => {
            const currentPlace = {
              name: 'Current location',
              type: 'Current location',
              continent: 'Unknown',
              lat: coords.latitude,
              lon: coords.longitude
            };
            selectLocation(currentPlace);

            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`
              );
              const details = await response.json();
              if (selectedLocation !== currentPlace) return;
              selectLocation({
                ...currentPlace,
                name: details.locality || details.city || details.principalSubdivision || details.countryName || 'Current location',
                continent: details.continent || 'Unknown',
                country: details.countryName,
                subdivision: details.principalSubdivision,
                countryCode: details.countryCode
              });
            } catch {
              document.getElementById('selectedPlaceType').textContent = 'GPS coordinates';
            }
          },
          () => {
            document.getElementById('selectedLocationName').textContent = 'Location permission needed';
          },
          { enableHighAccuracy: false, timeout: 10000 }
        );
      });

      function createEarth(canvas, host) {
        if (!window.THREE) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        camera.position.z = 3.2;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;

        const earth = new THREE.Mesh(
          new THREE.SphereGeometry(1, 64, 48),
          new THREE.MeshStandardMaterial({ color: 0x9bc6ff, roughness: 0.9 })
        );
        earth.rotation.y = -0.55;
        scene.add(earth);
        scene.add(new THREE.AmbientLight(0xffffff, 2.2));

        const sunlight = new THREE.DirectionalLight(0xffffff, 1.4);
        sunlight.position.set(-3, 2, 4);
        scene.add(sunlight);

        new THREE.TextureLoader().load(
          'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
          (texture) => {
            texture.encoding = THREE.sRGBEncoding;
            earth.material.map = texture;
            earth.material.color.set(0xffffff);
            earth.material.needsUpdate = true;
          }
        );

        const pin = new THREE.Group();
        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(0.055, 24, 16),
          new THREE.MeshBasicMaterial({ color: 0x1a73e8, transparent: true, opacity: 0.22 })
        );
        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(0.025, 24, 16),
          new THREE.MeshBasicMaterial({ color: 0xea4335 })
        );
        const pinStem = new THREE.Mesh(
          new THREE.ConeGeometry(0.012, 0.055, 16),
          new THREE.MeshBasicMaterial({ color: 0xea4335 })
        );
        pinStem.rotation.x = Math.PI / 2;
        pinStem.position.z = -0.026;
        pin.add(halo, marker, pinStem);
        pin.visible = false;
        earth.add(pin);

        const state = { canvas, host, scene, camera, renderer, earth, pin, countryFlags: new Map(), dragging: false, lastX: 0, lastY: 0 };
        earthScenes.push(state);

        host.addEventListener('pointerdown', (event) => {
          if (event.target.closest('button, a, input, textarea, select')) return;
          state.dragging = true;
          state.lastX = event.clientX;
          state.lastY = event.clientY;
          host.setPointerCapture(event.pointerId);
        });

        host.addEventListener('pointermove', (event) => {
          if (!state.dragging) return;
          const dx = event.clientX - state.lastX;
          const dy = event.clientY - state.lastY;
          state.lastX = event.clientX;
          state.lastY = event.clientY;
          earth.rotation.y += dx * 0.006;
          earth.rotation.x = Math.max(-0.8, Math.min(0.8, earth.rotation.x + dy * 0.004));
        });

        const stopDrag = () => { state.dragging = false; };
        host.addEventListener('pointerup', stopDrag);
        host.addEventListener('pointercancel', stopDrag);

        if (host.id === 'mapSurface') {
          host.addEventListener('wheel', (event) => {
            event.preventDefault();
            camera.position.z = Math.max(2.2, Math.min(5.2, camera.position.z + event.deltaY * 0.002));
          }, { passive: false });
        }

        const resize = () => {
          const bounds = canvas.getBoundingClientRect();
          const width = Math.max(1, bounds.width);
          const height = Math.max(1, bounds.height);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };

        new ResizeObserver(resize).observe(host);
        resize();
      }

      function animateEarth() {
        requestAnimationFrame(animateEarth);
        earthScenes.forEach(({ scene, camera, renderer, earth, dragging, pin, host }) => {
          if (!dragging) earth.rotation.y += 0.0008;
          renderer.render(scene, camera);

          if (pin?.visible && host.id === 'mapSurface' && selectedLocation) {
            const worldPosition = pin.getWorldPosition(new THREE.Vector3());
            worldPosition.project(camera);
            const bounds = host.getBoundingClientRect();
            const label = document.getElementById('mapPinLabel');
            label.style.left = `${(worldPosition.x + 1) * 50 * bounds.width}px`;
            label.style.top = `${(1 - worldPosition.y) * 50 * bounds.height}px`;
            label.hidden = worldPosition.z > 1;
          }
        });
      }

      renderPortfolio();
      createEarth(document.getElementById('heroEarth'), document.getElementById('globeDragArea'));
      createEarth(document.getElementById('mapEarth'), document.getElementById('mapSurface'));
      animateEarth();
