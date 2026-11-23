import { useState } from 'react';
import { Check, Copy, Download, RotateCcw } from 'lucide-react';
import { serializeGamesJson } from '../utils/gamesCatalog.js';

export function JsonLibrarySection({ games, hasCustomGames, onResetCustomGames }) {
  const [copied, setCopied] = useState(false);
  const jsonText = serializeGamesJson(games);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'games.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="json-library"
      aria-labelledby="json-library-heading"
      className="scroll-mt-20 mx-auto max-w-[1280px] px-6 py-12"
    >
      <div className="arcade-surface rounded-xl p-6 sm:p-8">
        <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-red-400">Iframe Data Store</p>
            <h2
              id="json-library-heading"
              className="font-display mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white"
            >
              games.json Library
            </h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              Every game in the catalog is stored as an <code className="font-mono-code text-red-400">&lt;iframe&gt;</code>{' '}
              entry inside <code className="font-mono-code text-zinc-200">/public/games.json</code>.
              Add custom titles and export the updated JSON anytime.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {hasCustomGames && (
              <button
                type="button"
                onClick={onResetCustomGames}
                className="arcade-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset Custom
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="arcade-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
                  Copied JSON
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Copy JSON
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="arcade-btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download games.json
            </button>
          </div>
        </div>

        <pre
          data-testid="json-preview"
          className="font-mono-code mt-6 max-h-[340px] overflow-auto rounded-lg border border-[var(--border-subtle)] bg-[#08080a] p-4 text-xs leading-relaxed text-zinc-300"
        >
          {jsonText}
        </pre>
      </div>
    </section>
  );
}
