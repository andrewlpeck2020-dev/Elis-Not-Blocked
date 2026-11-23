import { useState } from 'react';
import { EyeOff, Play } from 'lucide-react';

const HERO_IMAGE = '/src/assets/images/hero_arcade_backdrop_1795477217425.jpg';

export function HeroSpotlight({
  featuredGame,
  totalGames,
  onPlayFeatured,
  onToggleStudyCover,
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[#08080a]"
    >
      <div className="mx-auto max-w-[1280px] px-6 py-10 lg:py-14">
        <div className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[#101014] min-h-[340px] lg:min-h-[400px] flex items-center">
          {!imgError ? (
            <img
              src={HERO_IMAGE}
              alt="Dark matte obsidian arcade lounge illuminated with crimson accent lighting"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="absolute inset-0 h-full w-full object-cover object-center opacity-75"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#19080a] via-[#0d0d10] to-[#08080a]"
              aria-hidden="true"
            />
          )}

          <div
            className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/88 to-transparent"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-xl px-7 py-10 sm:px-12 sm:py-14">
            <p className="text-xs font-medium tracking-wide text-red-400">
              School Arcade · {totalGames} Iframe Games Loaded
            </p>
            <h1 className="font-display hero-headline mt-3 font-bold tracking-tight text-white">
              Elis Not Blocked
            </h1>
            <p className="mt-4 max-w-md text-sm sm:text-base leading-relaxed text-zinc-300">
              Fast, distraction-free HTML5 games stored directly as iframes inside{' '}
              <code className="font-mono-code text-xs text-red-400">games.json</code>. Launch any
              title in one click or add custom embeds.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {featuredGame && (
                <button
                  type="button"
                  onClick={() => onPlayFeatured(featuredGame)}
                  className="arcade-btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                  Play {featuredGame.title}
                </button>
              )}
              <button
                type="button"
                onClick={onToggleStudyCover}
                className="arcade-btn-secondary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
              >
                <EyeOff className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                Study Cover (\)
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
