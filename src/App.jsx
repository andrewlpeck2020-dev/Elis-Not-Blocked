import { useCallback, useEffect, useMemo, useState } from 'react';
import { AddGameModal } from './components/AddGameModal.jsx';
import { CatalogToolbar } from './components/CatalogToolbar.jsx';
import { GameCard } from './components/GameCard.jsx';
import { GamePlayerStage } from './components/GamePlayerStage.jsx';
import { Header } from './components/Header.jsx';
import { HeroSpotlight } from './components/HeroSpotlight.jsx';
import { JsonLibrarySection } from './components/JsonLibrarySection.jsx';
import { StudyCoverOverlay } from './components/StudyCoverOverlay.jsx';
import { filterGames, normalizeLoadedGames } from './utils/gamesCatalog.js';

const CUSTOM_GAMES_KEY = 'elis_not_blocked_custom_games';
const FAVORITES_KEY = 'elis_not_blocked_favorites';
const RECENT_KEY = 'elis_not_blocked_recent';

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

export default function App() {
  const [baseGames, setBaseGames] = useState([]);
  const [customGames, setCustomGames] = useState(() => readStoredCustomGames());
  const [favoriteIds, setFavoriteIds] = useState(() => readStoredList(FAVORITES_KEY));
  const [recentIds, setRecentIds] = useState(() => readStoredList(RECENT_KEY));

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [activeGameId, setActiveGameId] = useState(null);
  const [activeSection, setActiveSection] = useState('browse');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStudyCoverOpen, setIsStudyCoverOpen] = useState(false);

  const fetchGamesJson = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch('./games.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setBaseGames(normalizeLoadedGames(data));
    } catch {
      setLoadError('Could not load games.json catalog. Please retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGamesJson();
  }, [fetchGamesJson]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (e.key === '\\' && !isTyping) {
        e.preventDefault();
        setIsStudyCoverOpen((open) => !open);
      } else if (e.key === 'Escape' && isStudyCoverOpen) {
        setIsStudyCoverOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStudyCoverOpen]);

  const allGames = useMemo(() => [...baseGames, ...customGames], [baseGames, customGames]);

  const activeGame = useMemo(
    () => allGames.find((g) => g.id === activeGameId) ?? null,
    [allGames, activeGameId]
  );

  const featuredGame = useMemo(
    () => allGames.find((g) => g.featured) ?? allGames[0] ?? null,
    [allGames]
  );

  const filteredGames = useMemo(() => {
    const list = filterGames(allGames, {
      query,
      category,
      favoritesOnly,
      favoriteIds,
    });
    return featuredOnly ? list.filter((g) => g.featured) : list;
  }, [allGames, query, category, favoritesOnly, favoriteIds, featuredOnly]);

  const recentGames = useMemo(
    () =>
      recentIds
        .map((id) => allGames.find((g) => g.id === id))
        .filter(Boolean)
        .slice(0, 3),
    [recentIds, allGames]
  );

  const handlePlayGame = (game) => {
    setActiveGameId(game.id);
    setRecentIds((prev) => {
      const next = [game.id, ...prev.filter((id) => id !== game.id)].slice(0, 6);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = (id) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleAddCustomGame = (game) => {
    setCustomGames((prev) => {
      const next = [...prev, game];
      localStorage.setItem(CUSTOM_GAMES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleRemoveCustomGame = (id) => {
    setCustomGames((prev) => {
      const next = prev.filter((g) => g.id !== id);
      localStorage.setItem(CUSTOM_GAMES_KEY, JSON.stringify(next));
      return next;
    });
    if (activeGameId === id) {
      setActiveGameId(null);
    }
  };

  const handleResetCustomGames = () => {
    setCustomGames([]);
    localStorage.removeItem(CUSTOM_GAMES_KEY);
  };

  const handleNavigate = (section) => {
    setActiveSection(section);
    setActiveGameId(null);

    if (section === 'browse') {
      setFavoritesOnly(false);
      setFeaturedOnly(false);
      setCategory('All');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'featured') {
      setFavoritesOnly(false);
      setFeaturedOnly(true);
      setCategory('All');
      setTimeout(() => {
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
      }, 40);
    } else if (section === 'favorites') {
      setFeaturedOnly(false);
      setFavoritesOnly(true);
      setTimeout(() => {
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
      }, 40);
    } else if (section === 'json') {
      setTimeout(() => {
        document.getElementById('json-library')?.scrollIntoView({ behavior: 'smooth' });
      }, 40);
    }
  };

  const handlePlayRandom = () => {
    if (filteredGames.length === 0) return;
    const pick = filteredGames[Math.floor(Math.random() * filteredGames.length)];
    if (pick) handlePlayGame(pick);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08080a] text-zinc-100">
      <Header
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenAddGame={() => setIsAddModalOpen(true)}
      />

      <main className="flex-1">
        {activeGame ? (
          <GamePlayerStage
            game={activeGame}
            isFavorite={favoriteIds.includes(activeGame.id)}
            onBack={() => setActiveGameId(null)}
            onToggleFavorite={handleToggleFavorite}
            onToggleStudyCover={() => setIsStudyCoverOpen(true)}
          />
        ) : (
          <>
            <HeroSpotlight
              featuredGame={featuredGame}
              totalGames={allGames.length}
              onPlayFeatured={handlePlayGame}
              onToggleStudyCover={() => setIsStudyCoverOpen(true)}
            />

            <section id="catalog" className="scroll-mt-20 mx-auto max-w-[1280px] px-6 py-10">
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {featuredOnly
                      ? 'Featured Games'
                      : favoritesOnly
                        ? 'Saved Favorites'
                        : 'Game Library'}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-400 tabular-nums">
                    Showing {filteredGames.length} of {allGames.length} playable titles
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleNavigate('json')}
                    className="md:hidden text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer whitespace-nowrap"
                  >
                    JSON Library
                  </button>
                  {(featuredOnly || favoritesOnly || category !== 'All' || query) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedOnly(false);
                        setFavoritesOnly(false);
                        setCategory('All');
                        setQuery('');
                        setActiveSection('browse');
                      }}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer whitespace-nowrap"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              <CatalogToolbar
                query={query}
                onQueryChange={setQuery}
                category={category}
                onCategoryChange={(cat) => {
                  setCategory(cat);
                  setFeaturedOnly(false);
                }}
                favoritesOnly={favoritesOnly}
                onToggleFavoritesOnly={() => {
                  setFavoritesOnly((v) => !v);
                  setFeaturedOnly(false);
                }}
                favoriteCount={favoriteIds.length}
                visibleCount={filteredGames.length}
                onPlayRandom={handlePlayRandom}
              />

              {loading ? (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((slot) => (
                    <div
                      key={slot}
                      className="arcade-surface h-80 rounded-xl animate-pulse bg-[#121216]"
                    />
                  ))}
                </div>
              ) : loadError ? (
                <div className="arcade-surface mt-8 rounded-xl p-8 text-center">
                  <p className="text-sm font-medium text-red-400">{loadError}</p>
                  <button
                    type="button"
                    onClick={fetchGamesJson}
                    className="arcade-btn-primary mt-4 rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : filteredGames.length === 0 ? (
                <div className="arcade-surface mt-8 rounded-xl p-10 text-center">
                  <p className="text-base font-semibold text-white">No matching games found</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Try another search term, clear your category filter, or add a new iframe game.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setCategory('All');
                      setFavoritesOnly(false);
                      setFeaturedOnly(false);
                    }}
                    className="arcade-btn-secondary mt-5 rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Show All Games
                  </button>
                </div>
              ) : (
                <div
                  data-testid="game-grid"
                  className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      isFavorite={favoriteIds.includes(game.id)}
                      onPlay={handlePlayGame}
                      onToggleFavorite={handleToggleFavorite}
                      onRemoveCustom={handleRemoveCustomGame}
                    />
                  ))}
                </div>
              )}

              {recentGames.length > 0 && (
                <div className="mt-12 border-t border-[var(--border-subtle)] pt-8">
                  <h3 className="font-display text-xl font-bold text-white">Recently Played</h3>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {recentGames.map((game) => (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => handlePlayGame(game)}
                        className="arcade-btn-secondary rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap cursor-pointer"
                      >
                        {game.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <JsonLibrarySection
              games={allGames}
              hasCustomGames={customGames.length > 0}
              onResetCustomGames={handleResetCustomGames}
            />
          </>
        )}
      </main>

      <footer className="border-t border-[var(--border-subtle)] bg-[#08080a] py-6">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-6 text-xs text-zinc-500 sm:flex-row">
          <p>Elis Not Blocked · School Unblocked HTML5 Iframe Portal</p>
          <p>Press \ anytime to switch to Study Cover</p>
        </div>
      </footer>

      <AddGameModal
        isOpen={isAddModalOpen}
        existingIds={allGames.map((g) => g.id)}
        onClose={() => setIsAddModalOpen(false)}
        onAddGame={handleAddCustomGame}
      />

      <StudyCoverOverlay
        isOpen={isStudyCoverOpen}
        onClose={() => setIsStudyCoverOpen(false)}
      />
    </div>
  );
}
