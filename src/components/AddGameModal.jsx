import { useState } from 'react';
import { X } from 'lucide-react';
import { buildIframeMarkup, createSlugId, parseIframeEntry } from '../utils/gamesCatalog.js';

const CATEGORIES = ['Arcade', 'Action', 'Puzzle', 'Strategy'];

export function AddGameModal({ isOpen, existingIds, onClose, onAddGame }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Arcade');
  const [controls, setControls] = useState('Keyboard / Mouse');
  const [description, setDescription] = useState('');
  const [iframeInput, setIframeInput] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Game title is required.');
      return;
    }

    const parsed = parseIframeEntry(iframeInput, cleanTitle);
    if (!parsed.valid) {
      setError(parsed.error || 'Please enter a valid <iframe> tag or game URL.');
      return;
    }

    const newGame = {
      id: createSlugId(cleanTitle, existingIds),
      title: cleanTitle,
      category,
      controls: controls.trim() || 'Keyboard / Mouse',
      description:
        description.trim() || `Custom unblocked game loaded via iframe (${parsed.src}).`,
      thumbnail: '',
      iframe: buildIframeMarkup(parsed.src, cleanTitle),
      featured: false,
      isCustom: true,
    };

    onAddGame(newGame);
    setTitle('');
    setCategory('Arcade');
    setControls('Keyboard / Mouse');
    setDescription('');
    setIframeInput('');
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-game-title"
    >
      <div className="arcade-surface w-full max-w-lg rounded-xl border border-red-600/40 p-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 id="add-game-title" className="font-display text-2xl font-bold text-white">
            Add Iframe Game
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-md p-1.5 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-600/60 bg-red-950/50 px-3.5 py-2.5 text-xs font-medium text-red-200"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="custom-game-title" className="block text-xs font-semibold text-zinc-300">
              Game Title
            </label>
            <input
              id="custom-game-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Slope Tunnel"
              className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[#08080a] px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="custom-game-category"
                className="block text-xs font-semibold text-zinc-300"
              >
                Category
              </label>
              <select
                id="custom-game-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[#08080a] px-3 py-2 text-sm text-white focus:border-red-600 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="custom-game-controls"
                className="block text-xs font-semibold text-zinc-300"
              >
                Controls
              </label>
              <input
                id="custom-game-controls"
                type="text"
                value={controls}
                onChange={(e) => setControls(e.target.value)}
                placeholder="WASD / Mouse"
                className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[#08080a] px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="custom-game-iframe" className="block text-xs font-semibold text-zinc-300">
              Iframe HTML or Embed URL
            </label>
            <textarea
              id="custom-game-iframe"
              rows={3}
              value={iframeInput}
              onChange={(e) => {
                setIframeInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder='<iframe src="https://example.edu/game.html" allowfullscreen></iframe>'
              className="font-mono-code mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[#08080a] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Paste a full &lt;iframe&gt; tag or a direct https:// or /games/... URL.
            </p>
          </div>

          <div>
            <label
              htmlFor="custom-game-description"
              className="block text-xs font-semibold text-zinc-300"
            >
              Short Description (optional)
            </label>
            <input
              id="custom-game-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of gameplay..."
              className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[#08080a] px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="arcade-btn-secondary rounded-lg px-4 py-2 text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="arcade-btn-primary rounded-lg px-5 py-2 text-sm font-semibold cursor-pointer"
            >
              Save to Library
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
