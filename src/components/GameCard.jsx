import { useState } from 'react';
import { Gamepad2, Heart, Play, Trash2 } from 'lucide-react';

export function GameCard({
  game,
  isFavorite,
  onPlay,
  onToggleFavorite,
  onRemoveCustom,
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="arcade-card flex flex-col overflow-hidden rounded-xl">
      <div className="arcade-card-thumb relative overflow-hidden border-b border-[var(--border-subtle)]">
        {game.thumbnail && !imgError ? (
          <img
            src={game.thumbnail}
            alt={`${game.title} cover art`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-200 hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#1b090c] via-[#111115] to-[#0a0a0d] p-4 text-center">
            <Gamepad2 className="h-8 w-8 text-red-500" aria-hidden="true" />
            <span className="font-display text-lg font-bold text-zinc-200">{game.title}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-bold tracking-tight text-white">
            {game.title}
          </h3>
          <button
            type="button"
            onClick={() => onToggleFavorite(game.id)}
            aria-label={isFavorite ? `Remove ${game.title} from favorites` : `Favorite ${game.title}`}
            aria-pressed={isFavorite}
            className={`rounded-md p-1.5 transition-colors cursor-pointer shrink-0 ${
              isFavorite ? 'text-red-500' : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
          <span className="text-red-400 font-medium">{game.category}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{game.controls}</span>
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400 line-clamp-2">
          {game.description}
        </p>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPlay(game)}
            className="arcade-btn-primary inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
            Play {game.title}
          </button>

          {game.isCustom && onRemoveCustom && (
            <button
              type="button"
              onClick={() => onRemoveCustom(game.id)}
              aria-label={`Remove ${game.title}`}
              className="arcade-btn-secondary rounded-lg p-2 text-zinc-400 hover:text-red-400 cursor-pointer shrink-0"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
