import { useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  EyeOff,
  Heart,
  Maximize2,
  Monitor,
  RotateCw,
} from 'lucide-react';
import { parseIframeEntry } from '../utils/gamesCatalog.js';

export function GamePlayerStage({
  game,
  isFavorite,
  onBack,
  onToggleFavorite,
  onToggleStudyCover,
}) {
  const stageRef = useRef(null);
  const iframeRef = useRef(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [theaterMode, setTheaterMode] = useState(false);
  const [showIframeCode, setShowIframeCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const parsed = parseIframeEntry(game.iframe, game.title);

  const handleFullscreen = () => {
    const el = stageRef.current;
    if (el && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        // Ignore fullscreen rejection in restricted sandbox iframes
      });
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(game.iframe);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      aria-label={`Playing ${game.title}`}
      className={`mx-auto px-6 py-8 ${theaterMode ? 'max-w-[1440px]' : 'max-w-[1160px]'}`}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="arcade-btn-secondary inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-red-500" aria-hidden="true" />
            Back to Library
          </button>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {game.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="text-red-400 font-medium">{game.category}</span>
              <span aria-hidden="true">·</span>
              <span>{game.controls}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="arcade-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            Reload
          </button>

          <button
            type="button"
            onClick={() => setTheaterMode((v) => !v)}
            aria-pressed={theaterMode}
            className="arcade-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
            {theaterMode ? 'Standard View' : 'Theater Mode'}
          </button>

          <button
            type="button"
            onClick={handleFullscreen}
            className="arcade-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            Fullscreen
          </button>

          <button
            type="button"
            onClick={() => onToggleFavorite(game.id)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remove ${game.title} from favorites` : `Favorite ${game.title}`}
            className={`arcade-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
              isFavorite ? 'border-red-600 text-red-400' : ''
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
            {isFavorite ? 'Favorited' : 'Favorite'}
          </button>

          <button
            type="button"
            onClick={onToggleStudyCover}
            className="arcade-btn-primary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
            Study Cover (\)
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        data-testid="game-iframe-stage"
        className={`arcade-iframe-stage relative w-full overflow-hidden rounded-xl ${
          theaterMode ? 'h-[76vh] min-h-[480px]' : 'aspect-video min-h-[400px]'
        }`}
      >
        {parsed.valid ? (
          <iframe
            ref={iframeRef}
            key={`${game.id}-${reloadKey}`}
            src={parsed.src}
            title={parsed.title}
            allow={parsed.allowFullscreen ? 'fullscreen; gamepad' : 'gamepad'}
            onLoad={() => iframeRef.current?.focus()}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
            <p className="text-sm font-semibold text-red-400">Unable to load iframe source</p>
            <p className="mt-2 text-xs text-zinc-400">{parsed.error}</p>
          </div>
        )}
      </div>

      <div className="mt-5 arcade-surface rounded-xl p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-300">{game.description}</p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowIframeCode((v) => !v)}
              aria-expanded={showIframeCode}
              className="arcade-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer"
            >
              <Code2 className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
              {showIframeCode ? 'Hide JSON Iframe' : 'Inspect JSON Iframe'}
            </button>
            <button
              type="button"
              onClick={handleCopyEmbed}
              className="arcade-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Copy Iframe
                </>
              )}
            </button>
          </div>
        </div>

        {showIframeCode && (
          <pre className="font-mono-code mt-4 overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[#08080a] p-4 text-xs text-zinc-300">
            {JSON.stringify(
              {
                id: game.id,
                title: game.title,
                category: game.category,
                controls: game.controls,
                iframe: game.iframe,
              },
              null,
              2
            )}
          </pre>
        )}
      </div>
    </section>
  );
}
