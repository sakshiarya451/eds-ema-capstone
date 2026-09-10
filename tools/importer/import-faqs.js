/* eslint-disable */
/* global WebImporter */

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';

// PARSER REGISTRY (all blocks built inline below)
const parsers = {};

// PAGE TEMPLATE CONFIGURATION
// Source (verified against wknd.site/us/en/faqs.html): a single two-column
// section —
//  Left column:  h1 "FAQs" + intro image + intro paragraph + accordion (7 Q&A)
//  Right column: <hr> + "Need more help?" (h3) + contact paragraph
// The accordion is migrated to the NEW `accordion` block (Block Collection).
const PAGE_TEMPLATE = {
  name: 'faq-page',
  description: 'FAQ page: two-column body — intro + accordion (7 Q&A) left, help sidebar right',
  urls: ['https://wknd.site/us/en/faqs.html'],
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

/** Extract the 7 Q&A pairs from the source accordion. */
function extractFaqs(document) {
  const items = [...document.querySelectorAll('.cmp-accordion__item')];
  return items.map((it) => {
    const q = (it.querySelector('.cmp-accordion__title, .cmp-accordion__button') || {})
      .textContent?.trim() || '';
    const panel = it.querySelector('.cmp-accordion__panel');
    // answer: prefer the panel's paragraph text
    const aEl = panel ? (panel.querySelector('p') || panel) : null;
    const a = aEl ? aEl.textContent.trim() : '';
    return { q, a };
  }).filter((x) => x.q);
}

export default {
  transform: (payload) => {
    const {
      document, url, params,
    } = payload;

    const main = document.body;

    // Capture source pieces BEFORE cleanup mutates the DOM.
    const h1Text = (document.querySelector('main h1') || {}).textContent?.trim() || 'FAQs';
    const introImg = document.querySelector('main img');
    const introP = [...document.querySelectorAll('main p')]
      .find((p) => /collective of outdoors/i.test(p.textContent));
    const introText = introP ? introP.textContent.trim() : '';
    const faqs = extractFaqs(document);

    // Sidebar "Need more help?" + contact paragraph.
    const helpHeading = [...document.querySelectorAll('main h3')]
      .find((h) => /need more help/i.test(h.textContent));
    const helpTitle = helpHeading ? helpHeading.textContent.trim() : 'Need more help?';
    const contactP = [...document.querySelectorAll('main p')]
      .find((p) => /give us a call/i.test(p.textContent));
    // clone the contact paragraph so its links (phone / email) survive
    const contactClone = contactP ? contactP.cloneNode(true) : null;

    // Rebuild imperatively.
    executeTransformers('beforeTransform', main, payload);
    main.textContent = '';

    // ---- Left column content ----
    const left = [];
    const h1 = document.createElement('h1');
    h1.textContent = h1Text;
    left.push(h1);
    if (introImg) left.push(introImg.cloneNode(true));
    if (introText) {
      const p = document.createElement('p');
      p.textContent = introText;
      left.push(p);
    }
    // accordion block: rows of [question | answer]
    const accordionRows = faqs.map((f) => {
      const qCell = document.createElement('div');
      qCell.textContent = f.q;
      const aCell = document.createElement('div');
      const ap = document.createElement('p');
      ap.textContent = f.a;
      aCell.append(ap);
      return [qCell, aCell];
    });
    const accordionBlock = WebImporter.Blocks.createBlock(document, {
      name: 'accordion',
      cells: accordionRows,
    });
    left.push(accordionBlock);

    // ---- Right column content ----
    const right = [];
    right.push(document.createElement('hr'));
    const h3 = document.createElement('h3');
    h3.textContent = helpTitle;
    right.push(h3);
    if (contactClone) right.push(contactClone);

    // ---- columns (faq) block: one row, two cells ----
    const columnsBlock = WebImporter.Blocks.createBlock(document, {
      name: 'columns (faq)',
      cells: [[left, right]],
    });
    main.appendChild(columnsBlock);

    // afterTransform + metadata.
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
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: ['columns (faq)', 'accordion'] },
    }];
  },
};
