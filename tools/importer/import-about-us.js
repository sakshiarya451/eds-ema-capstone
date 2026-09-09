/* eslint-disable */
/* global WebImporter */

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';

// PARSER REGISTRY (contributor cards built inline below)
const parsers = {};

// PAGE TEMPLATE CONFIGURATION
// Source (verified against wknd.site/us/en/about-us.html): a single flat
// section with 5 logical parts —
//  1. h1 "About Us"
//  2. h2 "Our Contributors" + intro paragraph
//  3. 4 contributor person cards → cards (contributors)
//  4. h2 "WKND Guides" + intro paragraph
//  5. 3 guide person cards → cards (contributors)
// Each person card = circular avatar + name (h3) + role (h5) + 3 social links.
// There is no body/bio text. The person data is captured from the source DOM
// at transform time (names, roles, avatar images, social hrefs).
const PAGE_TEMPLATE = {
  name: 'content-overview',
  description: 'About Us: title, two contributor groups (Our Contributors, WKND Guides) as person cards',
  urls: ['https://wknd.site/us/en/about-us.html'],
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
 * Find the person-card containers in source order: each has an image, a name
 * (h3) and a role (h5). Returns an array of { name, role, img, socials }.
 */
function extractPeople(document) {
  const names = [...document.querySelectorAll('main h3, .cmp-title__text')]
    .filter((h) => h.tagName === 'H3');
  const people = [];
  names.forEach((h3) => {
    // climb to the card container that holds img + h3 + h5
    let card = h3;
    for (let i = 0; i < 6 && card.parentElement; i += 1) {
      card = card.parentElement;
      if (card.querySelector('img') && card.querySelector('h3') && card.querySelector('h5')) break;
    }
    const img = card.querySelector('img');
    const h5 = card.querySelector('h5');
    const socials = [...card.querySelectorAll('a[href]')].map((a) => ({
      label: (a.getAttribute('aria-label') || a.textContent || '').trim(),
      href: a.getAttribute('href') || '#',
    }));
    people.push({
      name: h3.textContent.trim(),
      role: h5 ? h5.textContent.trim() : '',
      img,
      socials,
    });
  });
  return people;
}

/**
 * Build a cards (contributors) block from a list of people. Each row is:
 *   [ avatar image | name (h3) + role (h5) + social links ]
 */
function buildContributorBlock(document, people) {
  const rows = people.map((p) => {
    const imgCell = p.img ? p.img.cloneNode(true) : '';
    const body = [];
    const h3 = document.createElement('h3');
    h3.textContent = p.name;
    body.push(h3);
    if (p.role) {
      const h5 = document.createElement('h5');
      h5.textContent = p.role;
      body.push(h5);
    }
    // social links (label derives the network icon in the block JS)
    p.socials.forEach((s) => {
      const a = document.createElement('a');
      a.setAttribute('href', s.href);
      a.textContent = s.label || 'Social';
      const wrap = document.createElement('p');
      wrap.append(a);
      body.push(wrap);
    });
    return [imgCell, body];
  });
  return WebImporter.Blocks.createBlock(document, {
    name: 'cards (contributors)',
    cells: rows,
  });
}

export default {
  transform: (payload) => {
    const {
      document, url, params,
    } = payload;

    const main = document.body;

    // Capture people BEFORE cleanup/parsing mutates the DOM. The first 4 are
    // "Our Contributors", the remaining 3 are "WKND Guides" (source order).
    const people = extractPeople(document);
    const contributors = people.slice(0, 4);
    const guides = people.slice(4);

    // Capture the two intro paragraphs (right after each h2).
    const h2s = [...document.querySelectorAll('main h2')];
    const introFor = (label) => {
      const h2 = h2s.find((h) => new RegExp(label, 'i').test(h.textContent));
      if (!h2) return '';
      // the intro paragraph is the nearest following .cmp-text / p
      let node = h2.closest('.title, [class*="title"]') || h2;
      // search subsequent siblings/containers for the intro text
      const scope = h2.closest('.cmp-container') || document.querySelector('main');
      const texts = [...scope.querySelectorAll('.cmp-text, p')]
        .map((t) => t.textContent.trim())
        .filter(Boolean);
      if (/contributors/i.test(label)) {
        return texts.find((t) => /outstanding individuals|compelling stories/i.test(t)) || '';
      }
      return texts.find((t) => /extraordinary travel guides|certified WKND guide/i.test(t)) || '';
    };
    const contributorsIntro = introFor('Our Contributors');
    const guidesIntro = introFor('WKND Guides');

    // Rebuild the page imperatively (the source markup is a deep XF grid).
    executeTransformers('beforeTransform', main, payload);
    main.textContent = '';

    const addH = (level, text) => {
      const h = document.createElement(`h${level}`);
      h.textContent = text;
      main.appendChild(h);
    };
    const addHr = () => main.appendChild(document.createElement('hr'));
    const addP = (text) => {
      if (!text) return;
      const p = document.createElement('p');
      p.textContent = text;
      main.appendChild(p);
    };

    // Section 1: page title.
    addH(1, 'About Us');

    // Section 2: Our Contributors heading + intro + card grid.
    addHr();
    addH(2, 'Our Contributors');
    addP(contributorsIntro);
    if (contributors.length) main.appendChild(buildContributorBlock(document, contributors));

    // Section 3: WKND Guides heading + intro + card grid.
    addHr();
    addH(2, 'WKND Guides');
    addP(guidesIntro);
    if (guides.length) main.appendChild(buildContributorBlock(document, guides));

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
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: ['cards (contributors)'] },
    }];
  },
};
