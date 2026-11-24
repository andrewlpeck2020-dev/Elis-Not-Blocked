import {
  buildIframeMarkup,
  createSlugId,
  filterGames,
  normalizeLoadedGames,
  parseIframeEntry,
  serializeGamesJson,
} from './utils/gamesCatalog.js';
import { createIcon } from './ui/icons.js';

const HERO_IMAGE = './src/assets/images/hero_arcade_backdrop_1795477217425.jpg';
const CUSTOM_GAMES_KEY = 'elis_not_blocked_custom_games';
const FAVORITES_KEY = 'elis_not_blocked_favorites';
const RECENT_KEY = 'elis_not_blocked_recent';
const CATEGORIES = ['All', 'Arcade', 'Action', 'Puzzle', 'Strategy'];

function readStoredList(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function readStoredCustomGames() {
  try {
    const raw = localStorage.getItem(CUSTOM_GAMES_KEY);
    if (!raw) return [];
    return normalizeLoadedGames(JSON.parse(raw)).map((g) => ({ ...g, isCustom: true }));
  } catch {
    return [];
  }
}

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'className') {
      node.className = value;
    } else if (key === 'textContent') {
      node.textContent = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'dataset' && typeof value === 'object') {
      for (const [dk, dv] of Object.entries(value)) {
        node.dataset[dk] = dv;
      }
    } else if (value === true) {
      node.setAttribute(key, '');
    } else {
      node.setAttribute(key, String(value));
    }
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

const state = {
  baseGames: [],
  customGames: readStoredCustomGames(),
  favoriteIds: readStoredList(FAVORITES_KEY),
  recentIds: readStoredList(RECENT_KEY),
  loading: true,
  loadError: null,
  activeGameId: null,
  activeSection: 'browse',
  query: '',
  category: 'All',
  favoritesOnly: false,
  featuredOnly: false,
  theaterMode: false,
  showIframeCode: false,
  reloadKey: 0,
  isAddModalOpen: false,
  isStudyCoverOpen: false,
  addFormError: null,
  copiedJson: false,
  copiedEmbed: false,
};

const rootEl = document.getElementById('root');

function getAllGames() {
  return [...state.baseGames, ...state.customGames];
}

function getFilteredGames() {
  const list = filterGames(getAllGames(), {
    query: state.query,
    category: state.category,
    favoritesOnly: state.favoritesOnly,
    favoriteIds: state.favoriteIds,
  });
  return state.featuredOnly ? list.filter((g) => g.featured) : list;
}

async function fetchGamesJson() {
  state.loading = true;
  state.loadError = null;
  render();
  try {
    let response = await fetch('./games.json');
    if (!response.ok) {
      response = await fetch('./public/games.json');
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    state.baseGames = normalizeLoadedGames(data);
  } catch {
    state.loadError = 'Could not load games.json catalog. Please retry.';
  } finally {
    state.loading = false;
    render();
  }
}

function playGame(game) {
  state.activeGameId = game.id;
  state.reloadKey = 0;
  state.showIframeCode = false;
  state.recentIds = [game.id, ...state.recentIds.filter((id) => id !== game.id)].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(state.recentIds));
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleFavorite(id) {
  state.favoriteIds = state.favoriteIds.includes(id)
    ? state.favoriteIds.filter((item) => item !== id)
    : [...state.favoriteIds, id];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.favoriteIds));
  render();
}

function removeCustomGame(id) {
  state.customGames = state.customGames.filter((g) => g.id !== id);
  localStorage.setItem(CUSTOM_GAMES_KEY, JSON.stringify(state.customGames));
  if (state.activeGameId === id) {
    state.activeGameId = null;
  }
  render();
}

function resetCustomGames() {
  state.customGames = [];
  localStorage.removeItem(CUSTOM_GAMES_KEY);
  render();
}

function navigateTo(section) {
  state.activeSection = section;
  state.activeGameId = null;

  if (section === 'browse') {
    state.favoritesOnly = false;
    state.featuredOnly = false;
    state.category = 'All';
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (section === 'featured') {
    state.favoritesOnly = false;
    state.featuredOnly = true;
    state.category = 'All';
    render();
    setTimeout(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }), 30);
  } else if (section === 'favorites') {
    state.featuredOnly = false;
    state.favoritesOnly = true;
    render();
    setTimeout(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }), 30);
  } else if (section === 'json') {
    render();
    setTimeout(() => document.getElementById('json-library')?.scrollIntoView({ behavior: 'smooth' }), 30);
  }
}

function buildHeader() {
  const navItems = [
    ['browse', 'Browse'],
    ['featured', 'Featured'],
    ['favorites', 'Favorites'],
    ['json', 'JSON Library'],
  ];

  return el(
    'header',
    { className: 'site-header' },
    el(
      'div',
      { className: 'container header-inner' },
      el(
        'a',
        {
          href: '#top',
          className: 'brand-mark',
          onClick: (e) => {
            e.preventDefault();
            navigateTo('browse');
          },
        },
        'ELIS ',
        el('span', { className: 'accent', textContent: 'NOT BLOCKED' })
      ),
      el(
        'nav',
        { className: 'primary-nav', 'aria-label': 'Primary' },
        navItems.map(([key, label]) =>
          el(
            'button',
            {
              type: 'button',
              className: 'arcade-nav-link',
              'aria-current': state.activeSection === key ? 'page' : undefined,
              onClick: () => navigateTo(key),
            },
            label
          )
        )
      ),
      el(
        'div',
        {},
        el(
          'button',
          {
            type: 'button',
            className: 'arcade-btn-primary',
            onClick: () => {
              state.addFormError = null;
              state.isAddModalOpen = true;
              render();
            },
          },
          createIcon('plus', 16),
          'Add Game'
        )
      )
    )
  );
}

function buildHero(allGames) {
  const featuredGame = allGames.find((g) => g.featured) ?? allGames[0] ?? null;

  const img = el('img', {
    src: HERO_IMAGE,
    alt: 'Dark matte obsidian arcade lounge illuminated with crimson accent lighting',
    referrerPolicy: 'no-referrer',
    className: 'hero-bg-img',
  });
  img.addEventListener('error', () => {
    img.remove();
  });

  return el(
    'section',
    { id: 'top', className: 'hero-section' },
    el(
      'div',
      { className: 'container' },
      el(
        'div',
        { className: 'hero-frame' },
        img,
        el('div', { className: 'hero-scrim', 'aria-hidden': 'true' }),
        el(
          'div',
          { className: 'hero-content' },
          el('p', {
            className: 'hero-kicker',
            textContent: `School Arcade · ${allGames.length} Iframe Games Loaded`,
          }),
          el('h1', { className: 'hero-headline', textContent: 'Elis Not Blocked' }),
          el(
            'p',
            { className: 'hero-copy' },
            'Fast, distraction-free HTML5 games stored directly as iframes inside ',
            el('code', { textContent: 'games.json' }),
            '. Launch any title in one click or add custom embeds.'
          ),
          el(
            'div',
            { className: 'hero-actions' },
            featuredGame
              ? el(
                  'button',
                  {
                    type: 'button',
                    className: 'arcade-btn-primary',
                    onClick: () => playGame(featuredGame),
                  },
                  createIcon('play', 16, true),
                  `Play ${featuredGame.title}`
                )
              : null,
            el(
              'button',
              {
                type: 'button',
                className: 'arcade-btn-secondary',
                onClick: () => {
                  state.isStudyCoverOpen = true;
                  render();
                },
              },
              createIcon('eyeOff', 16),
              'Study Cover (\\)'
            )
          )
        )
      )
    )
  );
}

function buildGameCard(game) {
  const isFav = state.favoriteIds.includes(game.id);
  const thumbWrap = el('div', { className: 'arcade-card-thumb' });

  const renderFallback = () => {
    thumbWrap.replaceChildren(
      el(
        'div',
        { className: 'thumb-fallback' },
        createIcon('gamepad', 32),
        el('span', { className: 'thumb-fallback-title', textContent: game.title })
      )
    );
  };

  if (game.thumbnail) {
    const img = el('img', {
      src: game.thumbnail,
      alt: `${game.title} cover art`,
      referrerPolicy: 'no-referrer',
    });
    img.addEventListener('error', renderFallback);
    thumbWrap.appendChild(img);
  } else {
    renderFallback();
  }

  return el(
    'article',
    { className: 'arcade-card' },
    thumbWrap,
    el(
      'div',
      { className: 'card-body' },
      el(
        'div',
        { className: 'card-title-row' },
        el('h3', { className: 'card-title', textContent: game.title }),
        el(
          'button',
          {
            type: 'button',
            className: `fav-icon-btn ${isFav ? 'is-favorite' : ''}`,
            'aria-label': isFav
              ? `Remove ${game.title} from favorites`
              : `Favorite ${game.title}`,
            'aria-pressed': String(isFav),
            onClick: () => toggleFavorite(game.id),
          },
          createIcon('heart', 16, isFav)
        )
      ),
      el(
        'div',
        { className: 'card-meta' },
        el('span', { className: 'card-meta-category', textContent: game.category }),
        el('span', { 'aria-hidden': 'true', textContent: '·' }),
        el('span', { className: 'card-meta-controls', textContent: game.controls })
      ),
      el('p', { className: 'card-desc', textContent: game.description }),
      el(
        'div',
        { className: 'card-actions' },
        el(
          'button',
          {
            type: 'button',
            className: 'arcade-btn-primary card-play-btn',
            onClick: () => playGame(game),
          },
          createIcon('play', 16, true),
          `Play ${game.title}`
        ),
        game.isCustom
          ? el(
              'button',
              {
                type: 'button',
                className: 'arcade-btn-secondary',
                'aria-label': `Remove ${game.title}`,
                onClick: () => removeCustomGame(game.id),
              },
              createIcon('trash', 16)
            )
          : null
      )
    )
  );
}

function buildCatalogSection(allGames, filteredGames) {
  const hasFilters =
    state.featuredOnly || state.favoritesOnly || state.category !== 'All' || Boolean(state.query);

  const searchInput = el('input', {
    id: 'game-search',
    type: 'search',
    className: 'search-input',
    placeholder: 'Search games or controls...',
    value: state.query,
  });
  searchInput.value = state.query;
  searchInput.addEventListener('input', (e) => {
    state.query = e.target.value;
    const caret = e.target.selectionStart;
    render();
    const nextInput = document.getElementById('game-search');
    if (nextInput) {
      nextInput.focus();
      if (typeof caret === 'number') {
        nextInput.setSelectionRange(caret, caret);
      }
    }
  });

  const toolbar = el(
    'div',
    { className: 'catalog-toolbar' },
    el(
      'div',
      { className: 'toolbar-left' },
      el(
        'div',
        {
          role: 'group',
          className: 'category-tabs',
          'aria-label': 'Filter games by category',
        },
        CATEGORIES.map((cat) =>
          el(
            'button',
            {
              type: 'button',
              className: `category-tab ${state.category === cat ? 'is-active' : ''}`,
              onClick: () => {
                state.category = cat;
                state.featuredOnly = false;
                render();
              },
            },
            cat
          )
        )
      ),
      el(
        'button',
        {
          type: 'button',
          className: `favorites-filter-btn ${state.favoritesOnly ? 'is-active' : ''}`,
          'aria-pressed': String(state.favoritesOnly),
          onClick: () => {
            state.favoritesOnly = !state.favoritesOnly;
            state.featuredOnly = false;
            render();
          },
        },
        createIcon('heart', 14, state.favoritesOnly),
        'Favorites ',
        el('span', { className: 'tabular-nums', textContent: `(${state.favoriteIds.length})` })
      )
    ),
    el(
      'div',
      { className: 'toolbar-right' },
      el(
        'div',
        { className: 'search-wrap' },
        el('label', { for: 'game-search', className: 'sr-only', textContent: 'Search games' }),
        el('span', { className: 'search-icon' }, createIcon('search', 16)),
        searchInput,
        state.query
          ? el(
              'button',
              {
                type: 'button',
                className: 'clear-search-btn',
                'aria-label': 'Clear search',
                onClick: () => {
                  state.query = '';
                  render();
                },
              },
              createIcon('x', 14)
            )
          : null
      ),
      el(
        'button',
        {
          type: 'button',
          className: 'arcade-btn-secondary',
          disabled: filteredGames.length === 0,
          onClick: () => {
            if (filteredGames.length === 0) return;
            const pick = filteredGames[Math.floor(Math.random() * filteredGames.length)];
            if (pick) playGame(pick);
          },
        },
        createIcon('shuffle', 14),
        'Random Game'
      )
    )
  );

  let bodyNode;
  if (state.loading) {
    bodyNode = el(
      'div',
      { className: 'game-grid' },
      [1, 2, 3].map(() => el('div', { className: 'arcade-surface', style: 'height:320px;' }))
    );
  } else if (state.loadError) {
    bodyNode = el(
      'div',
      { className: 'arcade-surface empty-panel' },
      el('p', { textContent: state.loadError }),
      el(
        'button',
        {
          type: 'button',
          className: 'arcade-btn-primary',
          style: 'margin-top:16px;',
          onClick: fetchGamesJson,
        },
        'Retry Loading'
      )
    );
  } else if (filteredGames.length === 0) {
    bodyNode = el(
      'div',
      { className: 'arcade-surface empty-panel' },
      el('h3', { textContent: 'No matching games found' }),
      el('p', {
        textContent:
          'Try another search term, clear your category filter, or add a new iframe game.',
      }),
      el(
        'button',
        {
          type: 'button',
          className: 'arcade-btn-secondary',
          style: 'margin-top:20px;',
          onClick: () => {
            state.query = '';
            state.category = 'All';
            state.favoritesOnly = false;
            state.featuredOnly = false;
            render();
          },
        },
        'Show All Games'
      )
    );
  } else {
    bodyNode = el(
      'div',
      { className: 'game-grid', dataset: { testid: 'game-grid' } },
      filteredGames.map(buildGameCard)
    );
  }

  const recentGames = state.recentIds
    .map((id) => allGames.find((g) => g.id === id))
    .filter(Boolean)
    .slice(0, 3);

  return el(
    'section',
    { id: 'catalog', className: 'container catalog-section' },
    el(
      'div',
      { className: 'section-header-row' },
      el(
        'div',
        {},
        el('h2', {
          className: 'section-title',
          textContent: state.featuredOnly
            ? 'Featured Games'
            : state.favoritesOnly
              ? 'Saved Favorites'
              : 'Game Library',
        }),
        el('p', {
          className: 'section-count tabular-nums',
          textContent: `Showing ${filteredGames.length} of ${allGames.length} playable titles`,
        })
      ),
      el(
        'div',
        { className: 'section-header-links' },
        el(
          'button',
          {
            type: 'button',
            className: 'text-action-btn mobile-only-link',
            onClick: () => navigateTo('json'),
          },
          'JSON Library'
        ),
        hasFilters
          ? el(
              'button',
              {
                type: 'button',
                className: 'text-action-btn',
                onClick: () => {
                  state.featuredOnly = false;
                  state.favoritesOnly = false;
                  state.category = 'All';
                  state.query = '';
                  state.activeSection = 'browse';
                  render();
                },
              },
              'Clear Filters'
            )
          : null
      )
    ),
    toolbar,
    bodyNode,
    recentGames.length > 0
      ? el(
          'div',
          { className: 'recent-bar' },
          el('h3', { className: 'recent-title', textContent: 'Recently Played' }),
          el(
            'div',
            { className: 'recent-list' },
            recentGames.map((g) =>
              el(
                'button',
                {
                  type: 'button',
                  className: 'arcade-btn-secondary',
                  onClick: () => playGame(g),
                },
                g.title
              )
            )
          )
        )
      : null
  );
}

function buildPlayerStage(game) {
  const isFav = state.favoriteIds.includes(game.id);
  const parsed = parseIframeEntry(game.iframe, game.title);
  const stageEl = el('div', {
    className: 'arcade-iframe-stage',
    dataset: { testid: 'game-iframe-stage' },
  });

  if (parsed.valid) {
    const iframe = el('iframe', {
      src: parsed.src,
      title: parsed.title,
      allow: parsed.allowFullscreen ? 'fullscreen; gamepad' : 'gamepad',
    });
    iframe.addEventListener('load', () => iframe.focus());
    stageEl.appendChild(iframe);
  } else {
    stageEl.appendChild(
      el(
        'div',
        { className: 'empty-panel' },
        el('p', { textContent: 'Unable to load iframe source' }),
        el('p', { textContent: parsed.error || '' })
      )
    );
  }

  return el(
    'section',
    {
      className: `player-section ${state.theaterMode ? 'is-theater' : ''}`,
      'aria-label': `Playing ${game.title}`,
    },
    el(
      'div',
      { className: 'player-topbar' },
      el(
        'div',
        { className: 'player-heading-group' },
        el(
          'button',
          {
            type: 'button',
            className: 'arcade-btn-secondary',
            onClick: () => {
              state.activeGameId = null;
              render();
            },
          },
          createIcon('arrowLeft', 16),
          'Back to Library'
        ),
        el(
          'div',
          {},
          el('h1', { className: 'player-title', textContent: game.title }),
          el(
            'div',
            { className: 'card-meta' },
            el('span', { className: 'card-meta-category', textContent: game.category }),
            el('span', { 'aria-hidden': 'true', textContent: '·' }),
            el('span', { textContent: game.controls })
          )
        )
      ),
      el(
        'div',
        { className: 'player-controls-group' },
        el(
          'button',
          {
            type: 'button',
            className: 'arcade-btn-secondary',
            onClick: () => {
              state.reloadKey += 1;
              render();
            },
          },
          createIcon('rotateCw', 14),
          'Reload'
        ),
        el(
          'button',
          {
            type: 'button',
            className: 'arcade-btn-secondary',
            'aria-pressed': String(state.theaterMode),
            onClick: () => {
              state.theaterMode = !state.theaterMode;
              render();
            },
          },
          createIcon('monitor', 14),
          state.theaterMode ? 'Standard View' : 'Theater Mode'
        ),
        el(
          'button',
          {
            type: 'button',
            className: 'arcade-btn-secondary',
            onClick: () => {
              if (stageEl.requestFullscreen) {
                stageEl.requestFullscreen().catch(() => {});
              }
            },
          },
          createIcon('maximize', 14),
          'Fullscreen'
        ),
        el(
          'button',
          {
            type: 'button',
            className: `arcade-btn-secondary ${isFav ? 'is-active' : ''}`,
            'aria-pressed': String(isFav),
            'aria-label': isFav
              ? `Remove ${game.title} from favorites`
              : `Favorite ${game.title}`,
            onClick: () => toggleFavorite(game.id),
          },
          createIcon('heart', 14, isFav),
          isFav ? 'Favorited' : 'Favorite'
        ),
        el(
          'button',
          {
            type: 'button',
            className: 'arcade-btn-primary',
            onClick: () => {
              state.isStudyCoverOpen = true;
              render();
            },
          },
          createIcon('eyeOff', 14),
          'Study Cover (\\)'
        )
      )
    ),
    stageEl,
    el(
      'div',
      { className: 'arcade-surface player-info-box' },
      el(
        'div',
        { className: 'player-info-row' },
        el('p', { className: 'player-desc', textContent: game.description }),
        el(
          'div',
          { className: 'player-embed-actions' },
          el(
            'button',
            {
              type: 'button',
              className: 'arcade-btn-secondary',
              'aria-expanded': String(state.showIframeCode),
              onClick: () => {
                state.showIframeCode = !state.showIframeCode;
                render();
              },
            },
            createIcon('code', 14),
            state.showIframeCode ? 'Hide JSON Iframe' : 'Inspect JSON Iframe'
          ),
          el(
            'button',
            {
              type: 'button',
              className: 'arcade-btn-secondary',
              onClick: async () => {
                try {
                  await navigator.clipboard.writeText(game.iframe);
                  state.copiedEmbed = true;
                  render();
                  setTimeout(() => {
                    state.copiedEmbed = false;
                    render();
                  }, 1800);
                } catch {
                  state.copiedEmbed = false;
                }
              },
            },
            createIcon(state.copiedEmbed ? 'check' : 'copy', 14),
            state.copiedEmbed ? 'Copied' : 'Copy Iframe'
          )
        )
      ),
      state.showIframeCode
        ? el('pre', {
            className: 'code-block',
            textContent: JSON.stringify(
              {
                id: game.id,
                title: game.title,
                category: game.category,
                controls: game.controls,
                iframe: game.iframe,
              },
              null,
              2
            ),
          })
        : null
    )
  );
}

function buildJsonLibrarySection(allGames) {
  const jsonText = serializeGamesJson(allGames);

  return el(
    'section',
    {
      id: 'json-library',
      className: 'container json-section',
      'aria-labelledby': 'json-library-heading',
    },
    el(
      'div',
      { className: 'arcade-surface json-box' },
      el(
        'div',
        { className: 'json-header' },
        el(
          'div',
          {},
          el('p', { className: 'hero-kicker', textContent: 'Iframe Data Store' }),
          el('h2', {
            id: 'json-library-heading',
            className: 'section-title',
            textContent: 'games.json Library',
          }),
          el(
            'p',
            { className: 'json-desc' },
            'Every game in the catalog is stored as an ',
            el('code', { textContent: '<iframe>' }),
            ' entry inside ',
            el('code', { textContent: 'games.json' }),
            '. Add custom titles and export the updated JSON anytime.'
          )
        ),
        el(
          'div',
          { className: 'json-actions' },
          state.customGames.length > 0
            ? el(
                'button',
                {
                  type: 'button',
                  className: 'arcade-btn-secondary',
                  onClick: resetCustomGames,
                },
                createIcon('rotateCcw', 14),
                'Reset Custom'
              )
            : null,
          el(
            'button',
            {
              type: 'button',
              className: 'arcade-btn-secondary',
              onClick: async () => {
                try {
                  await navigator.clipboard.writeText(jsonText);
                  state.copiedJson = true;
                  render();
                  setTimeout(() => {
                    state.copiedJson = false;
                    render();
                  }, 1800);
                } catch {
                  state.copiedJson = false;
                }
              },
            },
            createIcon(state.copiedJson ? 'check' : 'copy', 14),
            state.copiedJson ? 'Copied JSON' : 'Copy JSON'
          ),
          el(
            'button',
            {
              type: 'button',
              className: 'arcade-btn-primary',
              onClick: () => {
                const blob = new Blob([jsonText], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'games.json';
                link.click();
                URL.revokeObjectURL(url);
              },
            },
            createIcon('download', 14),
            'Download games.json'
          )
        )
      ),
      el('pre', {
        className: 'code-block',
        dataset: { testid: 'json-preview' },
        textContent: jsonText,
      })
    )
  );
}

function buildAddGameModal(allGames) {
  if (!state.isAddModalOpen) return null;

  const titleInput = el('input', {
    id: 'custom-game-title',
    type: 'text',
    className: 'form-control',
    placeholder: 'e.g. Slope Tunnel',
  });
  const catSelect = el(
    'select',
    { id: 'custom-game-category', className: 'form-control' },
    CATEGORIES.filter((c) => c !== 'All').map((c) => el('option', { value: c, textContent: c }))
  );
  const controlsInput = el('input', {
    id: 'custom-game-controls',
    type: 'text',
    className: 'form-control',
    value: 'Keyboard / Mouse',
    placeholder: 'WASD / Mouse',
  });
  const iframeInput = el('textarea', {
    id: 'custom-game-iframe',
    rows: '3',
    className: 'form-control font-mono-code',
    placeholder: '<iframe src="https://example.edu/game.html" allowfullscreen></iframe>',
  });
  const descInput = el('input', {
    id: 'custom-game-description',
    type: 'text',
    className: 'form-control',
    placeholder: 'Brief overview of gameplay...',
  });

  const form = el(
    'form',
    { className: 'modal-form', novalidate: true },
    state.addFormError
      ? el('div', { className: 'form-alert', role: 'alert', textContent: state.addFormError })
      : null,
    el(
      'div',
      {},
      el('label', { for: 'custom-game-title', className: 'form-label', textContent: 'Game Title' }),
      titleInput
    ),
    el(
      'div',
      { className: 'form-grid-2' },
      el(
        'div',
        {},
        el('label', {
          for: 'custom-game-category',
          className: 'form-label',
          textContent: 'Category',
        }),
        catSelect
      ),
      el(
        'div',
        {},
        el('label', {
          for: 'custom-game-controls',
          className: 'form-label',
          textContent: 'Controls',
        }),
        controlsInput
      )
    ),
    el(
      'div',
      {},
      el('label', {
        for: 'custom-game-iframe',
        className: 'form-label',
        textContent: 'Iframe HTML or Embed URL',
      }),
      iframeInput,
      el('p', {
        className: 'form-help',
        textContent: 'Paste a full <iframe> tag or a direct https:// or ./games/... URL.',
      })
    ),
    el(
      'div',
      {},
      el('label', {
        for: 'custom-game-description',
        className: 'form-label',
        textContent: 'Short Description (optional)',
      }),
      descInput
    ),
    el(
      'div',
      { className: 'modal-footer' },
      el(
        'button',
        {
          type: 'button',
          className: 'arcade-btn-secondary',
          onClick: () => {
            state.isAddModalOpen = false;
            state.addFormError = null;
            render();
          },
        },
        'Cancel'
      ),
      el('button', { type: 'submit', className: 'arcade-btn-primary', textContent: 'Save to Library' })
    )
  );

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const cleanTitle = titleInput.value.trim();
    if (!cleanTitle) {
      state.addFormError = 'Game title is required.';
      render();
      return;
    }
    const parsed = parseIframeEntry(iframeInput.value, cleanTitle);
    if (!parsed.valid) {
      state.addFormError = parsed.error || 'Please enter a valid <iframe> tag or game URL.';
      render();
      return;
    }

    const newGame = {
      id: createSlugId(
        cleanTitle,
        allGames.map((g) => g.id)
      ),
      title: cleanTitle,
      category: catSelect.value,
      controls: controlsInput.value.trim() || 'Keyboard / Mouse',
      description:
        descInput.value.trim() || `Custom unblocked game loaded via iframe (${parsed.src}).`,
      thumbnail: '',
      iframe: buildIframeMarkup(parsed.src, cleanTitle),
      featured: false,
      isCustom: true,
    };

    state.customGames = [...state.customGames, newGame];
    localStorage.setItem(CUSTOM_GAMES_KEY, JSON.stringify(state.customGames));
    state.isAddModalOpen = false;
    state.addFormError = null;
    render();
  });

  return el(
    'div',
    {
      className: 'modal-backdrop',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'add-game-title',
    },
    el(
      'div',
      { className: 'modal-card' },
      el(
        'div',
        { className: 'modal-header' },
        el('h2', { id: 'add-game-title', className: 'modal-title', textContent: 'Add Iframe Game' }),
        el(
          'button',
          {
            type: 'button',
            className: 'modal-close-btn',
            'aria-label': 'Close modal',
            onClick: () => {
              state.isAddModalOpen = false;
              state.addFormError = null;
              render();
            },
          },
          createIcon('x', 20)
        )
      ),
      form
    )
  );
}

function buildStudyCover() {
  if (!state.isStudyCoverOpen) return null;

  return el(
    'div',
    {
      className: 'study-cover',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'study-cover-title',
    },
    el(
      'div',
      { className: 'study-inner' },
      el(
        'div',
        { className: 'study-header' },
        el(
          'div',
          { className: 'study-title-wrap' },
          createIcon('bookOpen', 20),
          el('h1', {
            id: 'study-cover-title',
            textContent: 'AP Calculus & Physics Reference Sheet',
          })
        ),
        el(
          'button',
          {
            type: 'button',
            className: 'study-return-btn',
            onClick: () => {
              state.isStudyCoverOpen = false;
              render();
            },
          },
          createIcon('arrowLeft', 14),
          'Return to Elis Not Blocked'
        )
      ),
      el(
        'div',
        { className: 'study-grid' },
        el(
          'div',
          { className: 'study-card' },
          el('h2', { textContent: '01. Kinematics Equations' }),
          el(
            'ul',
            {},
            el('li', { textContent: 'v = v0 + at' }),
            el('li', { textContent: 'x = x0 + v0t + (1/2)at^2' }),
            el('li', { textContent: 'v^2 = v0^2 + 2a(x - x0)' }),
            el('li', { textContent: 'F_net = ma' })
          )
        ),
        el(
          'div',
          { className: 'study-card' },
          el('h2', { textContent: '02. Derivative Rules' }),
          el(
            'ul',
            {},
            el('li', { textContent: 'd/dx [x^n] = n * x^(n-1)' }),
            el('li', { textContent: 'd/dx [sin(x)] = cos(x)' }),
            el('li', { textContent: 'd/dx [cos(x)] = -sin(x)' }),
            el('li', { textContent: 'd/dx [e^x] = e^x' })
          )
        ),
        el(
          'div',
          { className: 'study-card study-card-wide' },
          el('h2', { textContent: '03. Fundamental Theorem of Calculus' }),
          el('p', {
            textContent:
              'If f is continuous on [a, b] and F is an antiderivative of f on [a, b], then the definite integral from a to b of f(x) dx equals F(b) - F(a). Press backslash (\\) or use the button above to return.',
          })
        )
      )
    )
  );
}

function render() {
  if (!rootEl) return;

  const allGames = getAllGames();
  const activeGame = allGames.find((g) => g.id === state.activeGameId) ?? null;
  const filteredGames = getFilteredGames();

  const shell = el(
    'div',
    { className: 'app-shell' },
    buildHeader(),
    el(
      'main',
      { className: 'app-main' },
      activeGame
        ? buildPlayerStage(activeGame)
        : [buildHero(allGames), buildCatalogSection(allGames, filteredGames), buildJsonLibrarySection(allGames)]
    ),
    el(
      'footer',
      { className: 'site-footer' },
      el(
        'div',
        { className: 'container footer-inner' },
        el('p', { textContent: 'Elis Not Blocked · School Unblocked HTML5 Iframe Portal' }),
        el('p', { textContent: 'Press \\ anytime to switch to Study Cover' })
      )
    ),
    buildAddGameModal(allGames),
    buildStudyCover()
  );

  rootEl.replaceChildren(shell);
}

window.addEventListener('keydown', (e) => {
  const target = e.target;
  const isTyping =
    target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable);

  if (e.key === '\\' && !isTyping) {
    e.preventDefault();
    state.isStudyCoverOpen = !state.isStudyCoverOpen;
    render();
  } else if (e.key === 'Escape' && state.isStudyCoverOpen) {
    state.isStudyCoverOpen = false;
    render();
  }
});

render();
fetchGamesJson();
