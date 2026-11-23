const ALLOWED_CATEGORIES = ['Arcade', 'Action', 'Puzzle', 'Strategy'];

export function isValidCategory(value) {
  return ALLOWED_CATEGORIES.includes(value);
}

export function isSafeIframeSrc(rawUrl) {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return false;
  }

  // Allow relative local paths such as /games/crimson-viper.html
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return !trimmed.includes('..');
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function parseIframeEntry(input, fallbackTitle = 'Unblocked Game') {
  const trimmed = String(input || '').trim();
  if (!trimmed) {
    return {
      valid: false,
      src: '',
      title: fallbackTitle,
      allowFullscreen: true,
      error: 'Enter an iframe HTML snippet or a valid game URL.',
    };
  }

  if (trimmed.toLowerCase().includes('<iframe')) {
    const srcMatch = trimmed.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const rawSrc = (srcMatch?.[1] ?? srcMatch?.[2] ?? srcMatch?.[3] ?? '').trim();

    if (!isSafeIframeSrc(rawSrc)) {
      return {
        valid: false,
        src: '',
        title: fallbackTitle,
        allowFullscreen: true,
        error: 'The iframe src must be an https://, http://, or /games/... path.',
      };
    }

    const titleMatch = trimmed.match(/\btitle\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    const title = (titleMatch?.[1] ?? titleMatch?.[2] ?? fallbackTitle).trim() || fallbackTitle;
    const allowFullscreen = /\ballowfullscreen\b/i.test(trimmed);

    return {
      valid: true,
      src: rawSrc,
      title,
      allowFullscreen,
    };
  }

  if (!isSafeIframeSrc(trimmed)) {
    return {
      valid: false,
      src: '',
      title: fallbackTitle,
      allowFullscreen: true,
      error: 'Provide an https://, http://, or /games/... URL, or a full <iframe> tag.',
    };
  }

  return {
    valid: true,
    src: trimmed,
    title: fallbackTitle,
    allowFullscreen: true,
  };
}

export function buildIframeMarkup(src, title) {
  const safeSrc = src.replace(/"/g, '&quot;');
  const safeTitle = title.replace(/"/g, '&quot;');
  return `<iframe src="${safeSrc}" title="${safeTitle}" allowfullscreen loading="lazy"></iframe>`;
}

export function createSlugId(title, existingIds) {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'custom-game';

  if (!existingIds.includes(base)) {
    return base;
  }

  let counter = 2;
  while (existingIds.includes(`${base}-${counter}`)) {
    counter += 1;
  }
  return `${base}-${counter}`;
}

export function filterGames(games, filter) {
  const normalizedQuery = filter.query.trim().toLowerCase();

  return games.filter((game) => {
    if (filter.favoritesOnly && !filter.favoriteIds.includes(game.id)) {
      return false;
    }
    if (filter.category !== 'All' && game.category !== filter.category) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }

    return (
      game.title.toLowerCase().includes(normalizedQuery) ||
      game.description.toLowerCase().includes(normalizedQuery) ||
      game.category.toLowerCase().includes(normalizedQuery) ||
      game.controls.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function normalizeLoadedGames(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }

  const validGames = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const id = typeof item.id === 'string' ? item.id.trim() : '';
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    const categoryRaw = typeof item.category === 'string' ? item.category.trim() : 'Arcade';
    const category = isValidCategory(categoryRaw) ? categoryRaw : 'Arcade';
    const controls = typeof item.controls === 'string' ? item.controls.trim() : 'Keyboard / Mouse';
    const description = typeof item.description === 'string' ? item.description.trim() : '';
    const thumbnail = typeof item.thumbnail === 'string' ? item.thumbnail.trim() : '';
    const iframe = typeof item.iframe === 'string' ? item.iframe.trim() : '';

    if (!id || !title || !iframe) {
      continue;
    }

    const parsed = parseIframeEntry(iframe, title);
    if (!parsed.valid) {
      continue;
    }

    validGames.push({
      id,
      title,
      category,
      controls,
      description,
      thumbnail,
      iframe: buildIframeMarkup(parsed.src, parsed.title),
      featured: Boolean(item.featured),
      isCustom: Boolean(item.isCustom),
    });
  }

  return validGames;
}

export function serializeGamesJson(games) {
  const cleaned = games.map(({ isCustom: _ignored, ...rest }) => rest);
  return JSON.stringify(cleaned, null, 2);
}
