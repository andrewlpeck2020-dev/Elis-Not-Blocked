import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildIframeMarkup,
  createSlugId,
  filterGames,
  normalizeLoadedGames,
  parseIframeEntry,
  serializeGamesJson,
} from './gamesCatalog.js';

test('parseIframeEntry extracts src and attributes from iframe HTML string', () => {
  const result = parseIframeEntry(
    '<iframe src="/games/crimson-viper.html" title="Crimson Viper" allowfullscreen loading="lazy"></iframe>'
  );
  assert.equal(result.valid, true);
  assert.equal(result.src, '/games/crimson-viper.html');
  assert.equal(result.title, 'Crimson Viper');
  assert.equal(result.allowFullscreen, true);
});

test('parseIframeEntry accepts direct https URLs and rejects javascript URLs', () => {
  const safeUrl = parseIframeEntry('https://example.edu/arcade/tetris.html', 'Block Stack');
  assert.equal(safeUrl.valid, true);
  assert.equal(safeUrl.src, 'https://example.edu/arcade/tetris.html');
  assert.equal(safeUrl.title, 'Block Stack');

  const xssAttempt = parseIframeEntry('<iframe src="javascript:alert(1)"></iframe>');
  assert.equal(xssAttempt.valid, false);

  const traversalAttempt = parseIframeEntry('/games/../../etc/passwd');
  assert.equal(traversalAttempt.valid, false);
});

test('filterGames filters by query, category, and favorites', () => {
  const sampleGames = [
    {
      id: 'viper',
      title: 'Crimson Viper',
      category: 'Arcade',
      controls: 'WASD',
      description: 'Grid serpent',
      thumbnail: '',
      iframe: buildIframeMarkup('/games/crimson-viper.html', 'Crimson Viper'),
    },
    {
      id: '2048',
      title: 'Crimson 2048',
      category: 'Puzzle',
      controls: 'Arrow Keys',
      description: 'Tile merger',
      thumbnail: '',
      iframe: buildIframeMarkup('/games/crimson-2048.html', 'Crimson 2048'),
    },
  ];

  assert.equal(
    filterGames(sampleGames, {
      query: 'viper',
      category: 'All',
      favoritesOnly: false,
      favoriteIds: [],
    }).length,
    1
  );

  assert.equal(
    filterGames(sampleGames, {
      query: '',
      category: 'Puzzle',
      favoritesOnly: false,
      favoriteIds: [],
    })[0]?.id,
    '2048'
  );

  assert.equal(
    filterGames(sampleGames, {
      query: '',
      category: 'All',
      favoritesOnly: true,
      favoriteIds: ['viper'],
    }).length,
    1
  );
});

test('normalizeLoadedGames drops unsafe entries and serializes clean JSON', () => {
  const normalized = normalizeLoadedGames([
    {
      id: 'good',
      title: 'Good Game',
      category: 'Action',
      controls: 'Mouse',
      description: 'Works',
      thumbnail: '/thumb.jpg',
      iframe: '<iframe src="/games/redline-dodge.html" allowfullscreen></iframe>',
      isCustom: true,
    },
    {
      id: 'bad',
      title: 'Bad Game',
      category: 'Action',
      iframe: '<iframe src="data:text/html,<script>alert(1)</script>"></iframe>',
    },
  ]);

  assert.equal(normalized.length, 1);
  assert.equal(normalized[0]?.id, 'good');

  const json = serializeGamesJson(normalized);
  const parsed = JSON.parse(json);
  assert.equal(parsed.length, 1);
  assert.equal('isCustom' in parsed[0], false);
});

test('createSlugId generates unique slugs', () => {
  assert.equal(createSlugId('Crimson Viper', ['crimson-viper']), 'crimson-viper-2');
  assert.equal(createSlugId('New Game!', ['crimson-viper']), 'new-game');
});
