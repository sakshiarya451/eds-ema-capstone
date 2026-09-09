import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Inline social-icon glyphs, shared with the footer. Keyed by the network
 * detected from the link's href/label. The contributor cards swap each social
 * link's text for the matching brand icon (label kept as aria-label).
 */
const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M22 5.8a8.5 8.5 0 0 1-2.36.65 4.13 4.13 0 0 0 1.81-2.27 8.2 8.2 0 0 1-2.61 1 4.1 4.1 0 0 0-7 3.74A11.64 11.64 0 0 1 3.39 4.6a4.16 4.16 0 0 0-.55 2.07 4.1 4.1 0 0 0 1.82 3.41 4.05 4.05 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.3 4.03 4.1 4.1 0 0 1-1.86.07 4.11 4.11 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.28a11.61 11.61 0 0 0 6.29 1.85c7.55 0 11.67-6.25 11.67-11.67v-.53A8.34 8.34 0 0 0 22 5.8z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2c2.72 0 3.06.01 4.12.06 1.07.05 1.8.22 2.43.47.66.25 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.25.63.42 1.36.47 2.43.05 1.07.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.07-.22 1.8-.47 2.43-.25.66-.6 1.22-1.15 1.77-.55.55-1.11.9-1.77 1.15-.63.25-1.36.42-2.43.47-1.07.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.07-.05-1.8-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.25-.63-.42-1.36-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.07.22-1.8.47-2.43.25-.66.6-1.22 1.15-1.77.55-.55 1.11-.9 1.77-1.15.63-.25 1.36-.42 2.43-.47C8.94 2.01 9.28 2 12 2zm0 1.8c-2.67 0-2.99.01-4.04.06-.98.04-1.5.21-1.86.35-.47.18-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.14.36-.31.88-.35 1.86-.05 1.05-.06 1.37-.06 4.04s.01 2.99.06 4.04c.04.98.21 1.5.35 1.86.18.47.4.8.75 1.15.35.35.68.57 1.15.75.36.14.88.31 1.86.35 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.98-.04 1.5-.21 1.86-.35.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.14-.36.31-.88.35-1.86.05-1.05.06-1.37.06-4.04s-.01-2.99-.06-4.04c-.04-.98-.21-1.5-.35-1.86a3.1 3.1 0 0 0-.75-1.15 3.1 3.1 0 0 0-1.15-.75c-.36-.14-.88-.31-1.86-.35C14.99 3.81 14.67 3.8 12 3.8zm0 3.06A5.14 5.14 0 1 1 12 17.14 5.14 5.14 0 0 1 12 6.86zm0 8.48A3.34 3.34 0 1 0 12 8.66a3.34 3.34 0 0 0 0 6.68zm6.54-8.69a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z"/></svg>',
};

function detectNetwork(a) {
  const hay = `${a.getAttribute('href') || ''} ${a.textContent}`.toLowerCase();
  return Object.keys(SOCIAL_ICONS).find((k) => hay.includes(k)) || null;
}

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

/**
 * Dynamic magazine listing: fetch query-index.json, keep magazine-article
 * pages, sort newest-first (lastModified desc), render as cards. No tabs.
 */
async function decorateMagazine(block) {
  block.textContent = '';

  let rows = [];
  try {
    const resp = await fetch('/query-index.json');
    if (resp.ok) {
      const json = await resp.json();
      rows = (json.data || [])
        .filter((r) => (r.template || '').trim() === 'magazine-article')
        .sort((a, b) => Number(b.lastModified || 0) - Number(a.lastModified || 0));
    }
  } catch (e) {
    rows = [];
  }

  const ul = document.createElement('ul');
  rows.forEach((row) => ul.append(buildCard(row)));
  block.append(ul);
}

/**
 * Contributor cards (About Us). Each authored row is a person:
 *   cell 1 = avatar image, cell 2 = name (h3) + role (h5) + social links.
 * We render a circular avatar, the name/role, and a row of brand social icons
 * (swapping each link's text for the matching glyph — same as the footer).
 */
function decorateContributors(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const li = document.createElement('li');

    // Avatar (first cell that holds a picture/img).
    const imgCell = cells.find((c) => c.querySelector('picture, img'));
    if (imgCell) {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'cards-card-image';
      const img = imgCell.querySelector('img');
      if (img) {
        imageDiv.append(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '400' }]));
      }
      li.append(imageDiv);
    }

    // Body: name + role + social links (everything not the image cell).
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'cards-card-body';
    cells.filter((c) => c !== imgCell).forEach((c) => {
      while (c.firstChild) bodyDiv.append(c.firstChild);
    });

    // Swap social link text for brand icons; wrap the links in a row.
    const socialLinks = [...bodyDiv.querySelectorAll('a[href]')]
      .filter((a) => detectNetwork(a));
    if (socialLinks.length) {
      const social = document.createElement('div');
      social.className = 'cards-card-social';
      socialLinks.forEach((a) => {
        const network = detectNetwork(a);
        const wrapper = a.parentElement;
        a.setAttribute('aria-label', a.textContent.trim() || network);
        a.classList.add('cards-card-social-icon');
        a.innerHTML = SOCIAL_ICONS[network];
        social.append(a);
        // drop the now-empty <p> wrapper the link was authored inside
        if (wrapper && wrapper !== bodyDiv && !wrapper.textContent.trim()
          && !wrapper.querySelector('a, img, picture')) {
          wrapper.remove();
        }
      });
      bodyDiv.append(social);
    }

    li.append(bodyDiv);
    ul.append(li);
  });

  block.replaceChildren(ul);
}

export default function decorate(block) {
  // Dynamic variant: adventures listing driven by query-index.json.
  if (block.classList.contains('adventures')) {
    decorateAdventures(block);
    return;
  }

  // Static variant: About Us contributor / guide person cards.
  if (block.classList.contains('contributors')) {
    decorateContributors(block);
    return;
  }

  // Dynamic variant: magazine listing (newest-first article cards).
  if (block.classList.contains('magazine')) {
    decorateMagazine(block);
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
