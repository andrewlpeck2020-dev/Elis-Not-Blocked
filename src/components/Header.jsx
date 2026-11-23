import { Plus } from 'lucide-react';

export function Header({ activeSection, onNavigate, onOpenAddGame }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[#08080a]">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-6 py-4">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('browse');
          }}
          className="font-display text-2xl font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          ELIS <span className="text-red-600">NOT BLOCKED</span>
        </a>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            type="button"
            onClick={() => onNavigate('browse')}
            aria-current={activeSection === 'browse' ? 'page' : undefined}
            className="arcade-nav-link whitespace-nowrap shrink-0 cursor-pointer"
          >
            Browse
          </button>
          <button
            type="button"
            onClick={() => onNavigate('featured')}
            aria-current={activeSection === 'featured' ? 'page' : undefined}
            className="arcade-nav-link whitespace-nowrap shrink-0 cursor-pointer"
          >
            Featured
          </button>
          <button
            type="button"
            onClick={() => onNavigate('favorites')}
            aria-current={activeSection === 'favorites' ? 'page' : undefined}
            className="arcade-nav-link whitespace-nowrap shrink-0 cursor-pointer"
          >
            Favorites
          </button>
          <button
            type="button"
            onClick={() => onNavigate('json')}
            aria-current={activeSection === 'json' ? 'page' : undefined}
            className="arcade-nav-link whitespace-nowrap shrink-0 cursor-pointer"
          >
            JSON Library
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenAddGame}
            className="arcade-btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Game
          </button>
        </div>
      </div>
    </header>
  );
}
