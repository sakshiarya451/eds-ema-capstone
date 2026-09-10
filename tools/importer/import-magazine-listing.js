/* eslint-disable */
/* global WebImporter */

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';

// PARSER REGISTRY (all blocks built inline below)
const parsers = {};

// PAGE TEMPLATE CONFIGURATION
// Source (verified against wknd.site/us/en/magazine.html): 7 sections —
//  1. h1 "Magazine"
//  2. Featured article teaser (cmp-teaser--featured) → columns (featured)
//  3. h2 "All Articles"
//  4. Article grid (cmp-image-list, 5 cards) → cards (magazine), DYNAMIC from
//     query-index.json (template=magazine-article, newest first)
//  5. h2 "Members Only" + text ("Sign in to un-lock…")
//  6. separator (hr)
//  7. Two locked member teasers (Alaskan Adventure, Fly Fishing the Amazon) —
//     title + description + "Read More" + teaser image → teasers (members)
//     block (2-up cards with lock badge + grey CTA, matching WKND).
const PAGE_TEMPLATE = {
  name: 'magazine-listing',
  description: 'Magazine listing: title, featured article, dynamic article grid, members-only section',
  urls: ['https://wknd.site/us/en/magazine.html'],
  blocks: [],
};

const transformers = [cleanupTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Locked member teaser → a `teasers (members)` block row: [body | image].
 * body = title (h2) + description + "Read More" label; image = the teaser's
 * hi-res picture. The teasers block renders the lock badge + grey CTA and the
 * 2-up card layout. Content is member-gated on WKND (no working href), so the
 * CTA is a non-navigating label.
 */
function buildTeaserRow(document, teaserEl) {
  const h2 = teaserEl.querySelector('.cmp-teaser__title, h2, h3');
  const desc = teaserEl.querySelector('.cmp-teaser__description, [class*="description"], p');
  const cta = teaserEl.querySelector('.cmp-teaser__action-link, .cmp-teaser__action-container, a');

  const body = [];
  if (h2 && h2.textContent.trim()) {
    const h = document.createElement('h2');
    h.textContent = h2.textContent.trim();
    body.push(h);
  }
  if (desc && desc.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = desc.textContent.trim();
    body.push(p);
  }
  const ctaText = (cta && cta.textContent.trim()) || 'Read More';
  const p2 = document.createElement('p');
  p2.textContent = ctaText;
  body.push(p2);

  // Prefer the hi-res image from the core-image data-cmp-src; fall back to <img>.
  let img = '';
  const cmpImg = teaserEl.querySelector('.cmp-image[data-cmp-src], [data-cmp-src]');
  const rawImg = teaserEl.querySelector('img');
  if (rawImg) {
    img = rawImg.cloneNode(true);
    if (cmpImg && cmpImg.getAttribute('data-cmp-src')) {
      const hi = cmpImg.getAttribute('data-cmp-src').replace('{.width}', '.1600');
      img.setAttribute('src', hi);
      img.removeAttribute('srcset');
    }
  }

  return [body, img];
}

export default {
  transform: (payload) => {
    const {
      document, url, params,
    } = payload;

    const main = document.body;

    // Capture source pieces BEFORE cleanup/parsing mutates the DOM.
    // Featured teaser (top, cmp-teaser--featured).
    const featured = document.querySelector('main div.teaser.cmp-teaser--featured, main .cmp-teaser--featured');
    let featuredData = null;
    if (featured) {
      featuredData = {
        pretitle: (featured.querySelector('.cmp-teaser__pretitle') || {}).textContent || '',
        title: (featured.querySelector('.cmp-teaser__title') || {}).textContent || '',
        desc: (featured.querySelector('.cmp-teaser__description') || {}).textContent || '',
        href: (featured.querySelector('.cmp-teaser__action-link') || {}).getAttribute
          ? featured.querySelector('.cmp-teaser__action-link').getAttribute('href') : '',
        cta: (featured.querySelector('.cmp-teaser__action-link') || {}).textContent || 'Read More',
        img: featured.querySelector('.cmp-teaser__image img, .cmp-image img, img'),
      };
    }

    // Members-only subtext (the .text block after the "Members Only" title).
    const membersText = [...document.querySelectorAll('main .text .cmp-text, main .cmp-text')]
      .map((t) => t.textContent.trim())
      .find((t) => /sign in/i.test(t)) || '';

    // The two locked member teasers (non-featured teasers).
    const memberTeasers = [...document.querySelectorAll('main div.teaser')]
      .filter((t) => !t.matches('.cmp-teaser--featured') && !t.querySelector('.cmp-teaser--featured'));

    // Wipe the body and rebuild the 7 sections imperatively so the output is
    // exactly the intended structure (the source markup is member-gated and
    // dynamic in places).
    executeTransformers('beforeTransform', main, payload);
    main.textContent = '';

    const addHr = () => main.appendChild(document.createElement('hr'));
    const addH = (level, text) => {
      const h = document.createElement(`h${level}`);
      h.textContent = text;
      main.appendChild(h);
    };

    // Section 1: page title.
    addH(1, 'Magazine');

    // Section 2: featured article → columns (featured). Row = [image | text].
    if (featuredData) {
      const textCell = [];
      if (featuredData.pretitle.trim()) {
        const p = document.createElement('p');
        p.textContent = featuredData.pretitle.trim();
        textCell.push(p);
      }
      if (featuredData.title.trim()) {
        const h = document.createElement('h2');
        h.textContent = featuredData.title.trim();
        textCell.push(h);
      }
      if (featuredData.desc.trim()) {
        const p = document.createElement('p');
        p.textContent = featuredData.desc.trim();
        textCell.push(p);
      }
      if (featuredData.href) {
        // Wrap the CTA in <strong><em> so decorateButtons renders the WKND
        // accent button.
        const a = document.createElement('a');
        a.setAttribute('href', featuredData.href);
        a.textContent = featuredData.cta.trim() || 'Read More';
        const strong = document.createElement('strong');
        const em = document.createElement('em');
        em.append(a);
        strong.append(em);
        const p = document.createElement('p');
        p.append(strong);
        textCell.push(p);
      }
      addHr();
      const block = WebImporter.Blocks.createBlock(document, {
        name: 'columns (featured)',
        cells: [[featuredData.img ? featuredData.img.cloneNode(true) : '', textCell]],
      });
      main.appendChild(block);
    }

    // Section 3: "All Articles" heading.
    addHr();
    addH(2, 'All Articles');

    // Section 4: dynamic article grid (filled at runtime by cards.magazine).
    const cardsBlock = WebImporter.Blocks.createBlock(document, {
      name: 'cards (magazine)',
      cells: [['']],
    });
    main.appendChild(cardsBlock);

    // Section 5: "Members Only" heading + subtext.
    addHr();
    addH(2, 'Members Only');
    if (membersText) {
      const p = document.createElement('p');
      p.textContent = membersText;
      main.appendChild(p);
    }

    // Section 6: separator.
    addHr();

    // Section 7: the two locked member teasers → teasers (members) block.
    const teaserRows = memberTeasers
      .map((t) => buildTeaserRow(document, t))
      .filter((row) => row[0].length); // skip empty
    if (teaserRows.length) {
      const teasersBlock = WebImporter.Blocks.createBlock(document, {
        name: 'teasers (members)',
        cells: teaserRows,
      });
      main.appendChild(teasersBlock);
    }

    // afterTransform (CTA wrapping etc.) + metadata.
    executeTransformers('afterTransform', main, payload);

    const hrEnd = document.createElement('hr');
    main.appendChild(hrEnd);
    WebImporter.rules.createMetadata(main, document);
    const metaTable = [...main.querySelectorAll('table')].find((t) => {
      const first = t.querySelector('tr td, tr th');
      return first && /^metadata$/i.test(first.textContent.trim());
    });
    if (metaTable) {
      const tr = document.createElement('tr');
      const k = document.createElement('td');
      k.textContent = 'Template';
      const v = document.createElement('td');
      v.textContent = PAGE_TEMPLATE.name;
      tr.append(k, v);
      (metaTable.querySelector('tbody') || metaTable).append(tr);
    }
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: ['columns (featured)', 'cards (magazine)', 'teasers (members)'] },
    }];
  },
};
