import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Site search results. The header search form does a GET to /us/en/search?q=…;
 * this block reads that query, fetches /query-index.json, matches it against
 * the title/description/path, and renders the hits as result cards (reusing the
 * `.cards` markup so existing card styling applies). Shows a heading with the
 * query + result count, and a friendly empty state when nothing matches.
 */

const INDEX_PATH = '/query-index.json';

/** Human labels for the template values stored in query-index. */
const TYPE_LABEL = {
  'magazine-article': 'Magazine',
  'adventure-detail': 'Adventure',
  'adventures-listing': 'Adventures',
  'magazine-listing': 'Magazine',
  'content-overview': 'About',
  'faq-page': 'FAQ',
};

function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('q') || '').trim();
}

/** Score a row against the query terms; 0 = no match. Title hits weigh most. */
function scoreRow(row, terms) {
  const title = (row.title || '').toLowerCase();
  const desc = (row.description || '').toLowerCase();
  const path = (row.path || '').toLowerCase();
  let score = 0;
  terms.forEach((t) => {
    if (title.includes(t)) score += 10;
    if (desc.includes(t)) score += 3;
    if (path.includes(t)) score += 1;
  });
  return score;
}

/** Build one result card <li> from a query-index row. */
function buildResult(row) {
  const li = document.createElement('li');

  const imageDiv = document.createElement('div');
  imageDiv.className = 'cards-card-image';
  if (row.image) {
    const a = document.createElement('a');
    a.href = row.path;
    // query-index stores the image as an absolute live URL; strip the origin so
    // it loads on whatever host serves this page (preview/live), avoiding CORS.
    let imgUrl = row.image;
    try {
      const u = new URL(row.image, window.location.href);
      imgUrl = u.pathname + u.search;
    } catch (e) { /* use as-is */ }
    a.append(createOptimizedPicture(imgUrl, row.title || '', false, [{ width: '750' }]));
    imageDiv.append(a);
  }

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'cards-card-body';
  const type = TYPE_LABEL[(row.template || '').trim()];
  if (type) {
    const tag = document.createElement('p');
    tag.className = 'search-result-type';
    tag.textContent = type;
    bodyDiv.append(tag);
  }
  const h3 = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = row.path;
  titleLink.textContent = row.title || row.path;
  h3.append(titleLink);
  bodyDiv.append(h3);
  if (row.description) {
    const p = document.createElement('p');
    p.textContent = row.description;
    bodyDiv.append(p);
  }

  li.append(imageDiv, bodyDiv);
  return li;
}

export default async function decorate(block) {
  const query = getQuery();

  // Keep the header search input in sync with the active query. The header
  // loads lazily (after this block decorates), so poll briefly for its input.
  if (query) {
    let tries = 0;
    const syncHeaderInput = () => {
      const input = document.querySelector('.nav-search input[name="q"]');
      if (input) {
        input.value = query;
      } else if (tries < 40) {
        tries += 1;
        setTimeout(syncHeaderInput, 100);
      }
    };
    syncHeaderInput();
  }

  block.textContent = '';
  block.classList.add('cards'); // reuse card styling for the result grid

  const heading = document.createElement('h1');
  heading.className = 'search-heading';
  block.append(heading);

  const status = document.createElement('p');
  status.className = 'search-status';
  block.append(status);

  if (!query) {
    heading.textContent = 'Search';
    status.textContent = 'Enter a search term above to find adventures, articles, and more.';
    return;
  }

  heading.textContent = `Search results for “${query}”`;
  status.textContent = 'Searching…';

  let rows = [];
  try {
    const resp = await fetch(INDEX_PATH);
    if (resp.ok) {
      const json = await resp.json();
      rows = json.data || [];
    }
  } catch (e) {
    rows = [];
  }

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = rows
    .map((row) => ({ row, score: scoreRow(row, terms) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.row);

  if (!results.length) {
    status.textContent = `No results found for “${query}”. Try a different search term.`;
    return;
  }

  status.textContent = `${results.length} result${results.length === 1 ? '' : 's'}`;

  const ul = document.createElement('ul');
  results.forEach((row) => ul.append(buildResult(row)));
  block.append(ul);
}
