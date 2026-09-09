import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Map a raw adventure Activity (from query-index) to one of WKND's five
 * adventures-listing filter tabs. WKND groups several activities under "Travel".
 */
const ACTIVITY_TO_TAB = {
  surfing: 'Surfing',
  'rock climbing': 'Climbing',
  climbing: 'Climbing',
  cycling: 'Cycling',
  skiing: 'Skiing',
  social: 'Travel',
  camping: 'Travel',
  travel: 'Travel',
};

const TAB_ORDER = ['All', 'Climbing', 'Cycling', 'Skiing', 'Surfing', 'Travel'];

function tabForActivity(activity) {
  return ACTIVITY_TO_TAB[(activity || '').trim().toLowerCase()] || 'Travel';
}

/** Build one card <li> from a query-index row (path, title, description, image). */
function buildCard(row) {
  const li = document.createElement('li');
  li.dataset.tab = tabForActivity(row.activity);

  const imageDiv = document.createElement('div');
  imageDiv.className = 'cards-card-image';
  if (row.image) {
    const a = document.createElement('a');
    a.href = row.path;
    // query-index stores the image as an absolute URL on the live host. Strip
    // the origin to a same-origin path so it loads on whatever host is serving
    // this page (branch preview / live) — an absolute live URL would be a
    // cross-origin image blocked by CORS on the .aem.page preview host.
    let imgUrl = row.image;
    try {
      const u = new URL(row.image, window.location.href);
      imgUrl = u.pathname + u.search;
    } catch (e) { /* not a URL — use as-is */ }
    const pic = createOptimizedPicture(imgUrl, row.title || '', false, [{ width: '750' }]);
    a.append(pic);
    imageDiv.append(a);
  }

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'cards-card-body';
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

/**
 * Dynamic adventures listing: fetch query-index.json, keep adventure-detail
 * pages, render as cards, and add WKND-style activity filter tabs.
 */
async function decorateAdventures(block) {
  block.textContent = '';

  let rows = [];
  try {
    const resp = await fetch('/query-index.json');
    if (resp.ok) {
      const json = await resp.json();
      rows = (json.data || [])
        .filter((r) => (r.template || '').trim() === 'adventure-detail')
        .sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
  } catch (e) {
    // network/index failure — leave the block empty rather than break the page
    rows = [];
  }

  // Which tabs actually have content (always include All).
  const present = new Set(rows.map((r) => tabForActivity(r.activity)));
  const tabs = TAB_ORDER.filter((t) => t === 'All' || present.has(t));

  // Tab bar.
  const tablist = document.createElement('div');
  tablist.className = 'cards-tabs';
  tablist.setAttribute('role', 'tablist');
  tabs.forEach((label, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cards-tab';
    btn.setAttribute('role', 'tab');
    btn.textContent = label;
    btn.dataset.tab = label;
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    tablist.append(btn);
  });

  // Card grid.
  const ul = document.createElement('ul');
  rows.forEach((row) => ul.append(buildCard(row)));

  const applyFilter = (label) => {
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const show = label === 'All' || li.dataset.tab === label;
      li.hidden = !show;
    });
    tablist.querySelectorAll('.cards-tab').forEach((b) => {
      b.setAttribute('aria-selected', b.dataset.tab === label ? 'true' : 'false');
    });
  };

  tablist.addEventListener('click', (e) => {
    const btn = e.target.closest('.cards-tab');
    if (btn) applyFilter(btn.dataset.tab);
  });

  block.append(tablist, ul);
  applyFilter('All');
}

export default function decorate(block) {
  // Dynamic variant: adventures listing driven by query-index.json.
  if (block.classList.contains('adventures')) {
    decorateAdventures(block);
    return;
  }

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
