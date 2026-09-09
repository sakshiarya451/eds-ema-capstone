/* eslint-disable */
/* global WebImporter */

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';

// PARSER REGISTRY (the intro teaser is built inline below, not via a parser)
const parsers = {};

// PAGE TEMPLATE CONFIGURATION
// Source (verified against wknd.site/us/en/adventures.html): 3 sections —
//  1. page title (h1 "Adventures")
//  2. intro teaser (h2 + paragraph + image) → columns block
//  3. "Current Adventures" heading + filterable card grid.
// Section 3's cards are rendered DYNAMICALLY from query-index.json
// (template=adventure-detail) by the cards.adventures block, so we do NOT
// import the 16 static source cards — we emit an empty cards (adventures)
// block that the block JS populates at runtime.
const PAGE_TEMPLATE = {
  name: 'adventures-listing',
  description: 'Adventures listing: title, intro columns, dynamic filterable adventure cards',
  urls: [
    'https://wknd.site/us/en/adventures.html',
  ],
  blocks: [],
};

// Section breaks are inserted manually in transform() (the 3 sections are
// built imperatively), so only the site-wide cleanup transformer runs here.
const transformers = [
  cleanupTransformer,
];

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


export default {
  transform: (payload) => {
    const {
      document, url, params,
    } = payload;

    const main = document.body;

    // Drop the source's static "Current Adventures" section (heading + filter
    // tabs + 16 hard-coded cards). We replace it with a dynamic cards
    // (adventures) block below, so none of that source markup should survive.
    // It is the LAST main.cmp-layout-container--fixed on the page.
    const fixedMains = [...document.querySelectorAll('main.cmp-layout-container--fixed, main.container.responsivegrid')];
    const currentAdvMain = fixedMains.reverse().find((m) => /current adventures/i.test(m.textContent));
    if (currentAdvMain) currentAdvMain.remove();

    // Build the intro block from the source hero teaser BEFORE section breaks
    // are inserted. WKND renders it as a full-bleed image with a white content
    // box (heading + paragraph) overlapping its bottom edge. We emit a
    // `columns (intro)` block: row 1 = image, row 2 = heading + paragraph; the
    // .columns.intro CSS reproduces the overlap.
    const heroTeaser = document.querySelector('main div.teaser.cmp-teaser--hero');
    if (heroTeaser) {
      const img = heroTeaser.querySelector('.cmp-teaser__image img, .cmp-image img, img');
      const h2 = heroTeaser.querySelector('.cmp-teaser__title, h2, h3');
      const desc = heroTeaser.querySelector('.cmp-teaser__description, [class*="description"], p');
      const textCell = [];
      if (h2) {
        const h = document.createElement('h2');
        h.textContent = h2.textContent.trim();
        textCell.push(h);
      }
      if (desc) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        textCell.push(p);
      }
      const introBlock = WebImporter.Blocks.createBlock(document, {
        name: 'columns (intro)',
        cells: [[img ? img.cloneNode(true) : ''], [textCell]],
      });
      // Section break BEFORE the intro so it becomes its own section.
      heroTeaser.replaceWith(document.createElement('hr'), introBlock);
    }

    // 1. beforeTransform / afterTransform (drop chrome, cleanup CTAs)
    executeTransformers('beforeTransform', main, payload);
    executeTransformers('afterTransform', main, payload);

    // Section 3: "Current Adventures" heading + dynamic cards block.
    // Emitted here (not imported) because the card grid is rendered from
    // query-index.json at runtime by the cards.adventures block.
    main.appendChild(document.createElement('hr'));
    const heading = document.createElement('h2');
    heading.textContent = 'Current Adventures';
    main.appendChild(heading);
    const cardsBlock = WebImporter.Blocks.createBlock(document, {
      name: 'cards (adventures)',
      cells: [['']],
    });
    main.appendChild(cardsBlock);

    // 6. WebImporter built-in rules + template metadata
    const hr = document.createElement('hr');
    main.appendChild(hr);
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
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: ['columns (intro)', 'cards (adventures)'] },
    }];
  },
};
