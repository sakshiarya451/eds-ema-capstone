/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselParser from './parsers/carousel.js';
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  carousel: carouselParser,
  columns: columnsParser,
  cards: cardsParser,
};

// PAGE TEMPLATE CONFIGURATION - embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'WKND homepage: carousel, featured columns, recent-articles cards, climbing columns, adventures cards',
  urls: [
    'https://wknd.site/us/en.html',
  ],
  blocks: [
    {
      name: 'carousel',
      instances: [
        'body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.carousel.panelcontainer.cmp-carousel--hero.aem-GridColumn.aem-GridColumn--default--12',
      ],
    },
    {
      name: 'columns',
      instances: [
        'body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(1) > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.teaser.cmp-teaser--featured.aem-GridColumn.aem-GridColumn--default--12',
        'body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.teaser.cmp-teaser--hero.cmp-teaser--imagebottom.aem-GridColumn.aem-GridColumn--default--12',
      ],
    },
    {
      name: 'cards',
      instances: [
        'body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(1) > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.image-list.list.aem-GridColumn.aem-GridColumn--default--12 ul.cmp-image-list',
        'body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.image-list.list.aem-GridColumn.aem-GridColumn--default--12 ul.cmp-image-list',
      ],
    },
  ],
  sections: [
    { id: 's1-carousel', name: 'Hero Carousel', style: null, blocks: ['carousel'], defaultContent: [] },
    { id: 's2-featured', name: 'Featured Article (Columns)', style: null, blocks: ['columns'], defaultContent: [] },
    { id: 's3-recent', name: 'Recent Articles (Cards + Button)', style: null, blocks: ['cards'], defaultContent: [] },
    { id: 's4-climbing', name: 'Climbing New Zealand (Columns)', style: null, blocks: ['columns'], defaultContent: [] },
    { id: 's5-whereto', name: 'Where do you want to go? (Cards + Button)', style: null, blocks: ['cards'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
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
 * Find all blocks on the page based on the embedded template configuration.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (drops global header/footer + chrome)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (section breaks + metadata + final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 4b. Split the flat output into WKND's 5 sections by inserting a section
    // break <hr> before each logical section start. WKND renders these as
    // distinct sections with vertical gaps; without breaks every block lands
    // in one section and the hero carousel visually merges into the featured
    // article. Anchor on the parsed blocks / section headings (robust against
    // the source-selector-based sections transformer, which needs selectors
    // the embedded template config doesn't carry).
    const insertBreakBefore = (node) => {
      if (node && node.parentNode) node.before(document.createElement('hr'));
    };
    const findHeading = (re) => [...main.querySelectorAll('h2, h3')]
      .find((h) => re.test(h.textContent));
    // Find the top-level child of main that contains the given text (blocks are
    // still <table> at this hook, so we anchor on their text, then climb to the
    // element that is a direct child of main).
    const findTopChildWith = (re) => {
      const el = [...main.querySelectorAll('*')].find((n) => re.test(n.textContent)
        && ![...n.children].some((c) => re.test(c.textContent)));
      if (!el) return null;
      let node = el;
      while (node && node.parentElement !== main) node = node.parentElement;
      return node;
    };
    // Section 2: Featured Article. The carousel and featured block are the
    // first two top-level children; insert a break after the carousel so the
    // featured article starts its own section (anchor on the carousel's own
    // block table via its unique "WKND Adventures" slide heading).
    // Section 2 boundary: insert a break before the featured block's table.
    // Blocks are still WebImporter <table>s nested in the source wrapper at this
    // hook, so anchor on the featured table (contains "Camping in Western
    // Australia") and place the <hr> immediately before it.
    const featuredHeadCell = [...main.querySelectorAll('table td, table th')]
      .find((c) => /Camping in Western Australia/i.test(c.textContent));
    const featuredTable = featuredHeadCell ? featuredHeadCell.closest('table') : null;
    insertBreakBefore(featuredTable);
    // Section 3: Recent Articles (heading + cards + All Articles link)
    insertBreakBefore(findHeading(/recent articles/i));
    // Section 4: Next Adventures (heading + climbing columns)
    insertBreakBefore(findHeading(/next adventures/i));
    // Section 5: Where do you want to go (heading + cards + All Trips link)
    insertBreakBefore(findHeading(/where do you want to go/i));

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    // Add a Template metadata row so query-index can classify pages
    // (e.g. dynamic listing filters magazine vs adventure vs homepage).
    // createMetadata appends a block TABLE (first cell "Metadata") to main —
    // find it and append a [Template | <name>] row.
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

    // 6. Sanitized path (root → /index guard)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
