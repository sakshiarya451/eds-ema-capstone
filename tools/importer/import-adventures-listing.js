/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsParser from './parsers/columns.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  columns: columnsParser,
};

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
  blocks: [
    { name: 'columns', instances: ['main div.teaser.cmp-teaser--hero'] },
  ],
  sections: [
    { id: 's1-title', name: 'Title', style: null, selector: 'main div.title, main .cmp-title', blocks: [], defaultContent: ['title'] },
    { id: 's2-intro', name: 'Intro', style: null, selector: 'main div.teaser.cmp-teaser--hero', blocks: ['columns'], defaultContent: [] },
  ],
};

const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
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

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
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

    // 1. beforeTransform (section breaks + drop chrome)
    executeTransformers('beforeTransform', main, payload);

    // 2/3. Find + parse blocks (the intro teaser → columns)
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name}:`, e);
        }
      }
    });

    // 4. afterTransform (section metadata + cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. Section 3: "Current Adventures" heading + dynamic cards block.
    // Emitted here (not imported) because the card grid is rendered from
    // query-index.json at runtime by the cards.adventures block.
    const hrBefore = document.createElement('hr');
    main.appendChild(hrBefore);
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
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
