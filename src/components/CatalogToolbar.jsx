import { Heart, Search, Shuffle, X } from 'lucide-react';

const CATEGORIES = ['All', 'Arcade', 'Action', 'Puzzle', 'Strategy'];

export function CatalogToolbar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  favoritesOnly,
  onToggleFavoritesOnly,
  favoriteCount,
  visibleCount,
  onPlayRandom,
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="Filter games by category"
          className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[#101014] p-1"
        >
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`rounded-md px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onToggleFavoritesOnly}
          aria-pressed={favoritesOnly}
          className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            favoritesOnly
              ? 'border-red-600 bg-red-600/15 text-red-400'
              : 'border-[var(--border-subtle)] bg-[#101014] text-zinc-300 hover:border-red-600/50 hover:text-white'
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${favoritesOnly ? 'fill-current' : ''}`} aria-hidden="true" />
          Favorites
          <span className="tabular-nums text-zinc-400">({favoriteCount})</span>
        </button>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative w-full sm:w-64">
          <label htmlFor="game-search" className="sr-only">
            Search games
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            id="game-search"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search games or controls..."
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[#0e0e12] py-2 pl-9 pr-8 text-sm text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onPlayRandom}
          disabled={visibleCount === 0}
          className="arcade-btn-secondary inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Shuffle className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
          Random Game
        </button>
      </div>
    </div>
  );
}
