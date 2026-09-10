import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// Inline social icon SVGs (brand glyphs). Keyed by the network detected from
// the link's text/href. Content (the link + its label) stays in the fragment;
// the block only swaps the visible label for the matching icon.
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
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Classify the four footer sections (matches WKND: brand | nav | social | legal)
  const classes = ['footer-brand', 'footer-nav', 'footer-social', 'footer-legal'];
  classes.forEach((c, i) => {
    const section = footer.children[i];
    if (section) section.classList.add(c);
  });

  // Keep the "Follow Us" heading an <h4> (WKND styling keys off the tag) but
  // give it aria-level=2 so it doesn't skip a level after the page's content
  // headings — satisfies the a11y "heading-order" rule on every page.
  footer.querySelectorAll('.footer-social h4').forEach((h) => h.setAttribute('aria-level', '2'));

  // Replace social link labels with brand SVG icons (label kept as aria-label).
  const social = footer.querySelector('.footer-social');
  if (social) {
    social.querySelectorAll('a[href]').forEach((a) => {
      const network = detectNetwork(a);
      if (!network) return;
      a.setAttribute('aria-label', a.textContent.trim());
      a.classList.add('footer-social-icon');
      a.innerHTML = SOCIAL_ICONS[network];
    });
  }

  block.append(footer);
}
