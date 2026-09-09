/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import breadcrumbsParser from './parsers/breadcrumbs.js';
import articleBodyParser from './parsers/article-body.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  breadcrumbs: breadcrumbsParser,
  'article-body': articleBodyParser,
};

// PAGE TEMPLATE CONFIGURATION
// Source structure (verified in Chromium against arctic-surfing):
// four flat siblings in the page grid — hero image, breadcrumb, body <main>,
// sidebar <aside> — mapping to 3 EDS sections in the same top-to-bottom order.
const PAGE_TEMPLATE = {
  name: 'magazine-article',
  description: 'Magazine article: hero image, breadcrumbs, two-column body (article + share/related sidebar)',
  urls: [
    'https://wknd.site/us/en/magazine/arctic-surfing.html',
  ],
  blocks: [
    { name: 'breadcrumbs', instances: ['main div.breadcrumb .cmp-breadcrumb'] },
    // The two-column body: LEFT = body main (title/byline/article/author bio),
    // RIGHT = the sidebar aside (merged in by the parser).
    { name: 'article-body', instances: ['main main.container:has(article.contentfragment)'] },
  ],
  sections: [
    // s1 hero image: first section, full content-width. No leading break.
    { id: 's1-hero', name: 'Hero image', style: null, selector: 'main div.image', blocks: [], defaultContent: ['image'] },
    { id: 's2-breadcrumb', name: 'Breadcrumb', style: null, selector: 'main div.breadcrumb', blocks: ['breadcrumbs'], defaultContent: [] },
    { id: 's3-body', name: 'Article body', style: null, selector: 'main main.container:has(article.contentfragment)', blocks: ['article-body'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY
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

    // 1. beforeTransform (section breaks inserted while DOM intact; drops chrome)
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

    // 4. afterTransform (section metadata + CTA wrapping + cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    // Template metadata row for query-index classification.
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
