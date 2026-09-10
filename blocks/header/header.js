import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

// Country → locale options for the language switcher (matches WKND). Each
// locale links to /{lang}/{country}; these landing pages don't exist yet, so
// they 404 by design — the switcher itself is the deliverable.
// Minimal inline SVG flags (20x14) — recognizable band flags that render
// consistently without relying on emoji fonts.
const FLAGS = {
  us: '<svg viewBox="0 0 20 14" width="20" height="14"><rect width="20" height="14" fill="#b22234"/><g fill="#fff"><rect y="2" width="20" height="2"/><rect y="6" width="20" height="2"/><rect y="10" width="20" height="2"/></g><rect width="9" height="8" fill="#3c3b6e"/></svg>',
  ca: '<svg viewBox="0 0 20 14" width="20" height="14"><rect width="20" height="14" fill="#fff"/><rect width="5" height="14" fill="#d52b1e"/><rect x="15" width="5" height="14" fill="#d52b1e"/><rect x="9" y="4" width="2" height="6" fill="#d52b1e"/></svg>',
  ch: '<svg viewBox="0 0 20 14" width="20" height="14"><rect width="20" height="14" fill="#d52b1e"/><rect x="8.5" y="3" width="3" height="8" fill="#fff"/><rect x="6" y="5.5" width="8" height="3" fill="#fff"/></svg>',
  de: '<svg viewBox="0 0 20 14" width="20" height="14"><rect width="20" height="4.67" fill="#000"/><rect y="4.67" width="20" height="4.67" fill="#d00"/><rect y="9.33" width="20" height="4.67" fill="#ffce00"/></svg>',
  fr: '<svg viewBox="0 0 20 14" width="20" height="14"><rect width="6.67" height="14" fill="#0055a4"/><rect x="6.67" width="6.67" height="14" fill="#fff"/><rect x="13.33" width="6.67" height="14" fill="#ef4135"/></svg>',
  es: '<svg viewBox="0 0 20 14" width="20" height="14"><rect width="20" height="14" fill="#c60b1e"/><rect y="3.5" width="20" height="7" fill="#ffc400"/></svg>',
  it: '<svg viewBox="0 0 20 14" width="20" height="14"><rect width="6.67" height="14" fill="#009246"/><rect x="6.67" width="6.67" height="14" fill="#fff"/><rect x="13.33" width="6.67" height="14" fill="#ce2b37"/></svg>',
};

const LOCALES = [
  {
    country: 'United States',
    flag: FLAGS.us,
    options: [{ label: 'EN-US', path: '/us/en' }, { label: 'ES-US', path: '/us/es' }],
  },
  {
    country: 'Canada',
    flag: FLAGS.ca,
    options: [{ label: 'EN-CA', path: '/ca/en' }, { label: 'FR-CA', path: '/ca/fr' }],
  },
  {
    country: 'Switzerland',
    flag: FLAGS.ch,
    options: [{ label: 'DE-CH', path: '/ch/de' }, { label: 'FR-CH', path: '/ch/fr' }, { label: 'IT-CH', path: '/ch/it' }],
  },
  {
    country: 'Germany',
    flag: FLAGS.de,
    options: [{ label: 'DE-DE', path: '/de/de' }],
  },
  {
    country: 'France',
    flag: FLAGS.fr,
    options: [{ label: 'FR-FR', path: '/fr/fr' }],
  },
  {
    country: 'Spain',
    flag: FLAGS.es,
    options: [{ label: 'ES-ES', path: '/es/es' }],
  },
  {
    country: 'Italy',
    flag: FLAGS.it,
    options: [{ label: 'IT-IT', path: '/it/it' }],
  },
];

/**
 * Turns the "#lang-toggle" utility link into a language switcher: a toggle that
 * opens a dropdown panel of country groups, each with clickable locale links
 * (WKND-style). The active locale (EN-US) is marked current.
 * @param {Element} navUtility The utility section element
 */
function decorateLangSwitcher(navUtility) {
  const langItem = [...navUtility.querySelectorAll('li')]
    .find((li) => li.querySelector('a[href*="lang"]'));
  if (!langItem) return;
  const trigger = langItem.querySelector('a');
  if (!trigger) return;

  langItem.classList.add('nav-lang');
  trigger.setAttribute('href', '#lang-toggle');
  trigger.setAttribute('role', 'button');
  trigger.setAttribute('aria-haspopup', 'true');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', 'Select language');

  // Build the dropdown panel.
  const panel = document.createElement('div');
  panel.className = 'nav-lang-panel';
  panel.hidden = true;
  const list = document.createElement('ul');
  LOCALES.forEach(({ country, flag, options }) => {
    const li = document.createElement('li');
    li.className = 'nav-lang-country';

    const head = document.createElement('div');
    head.className = 'nav-lang-country-head';
    const flagSpan = document.createElement('span');
    flagSpan.className = 'nav-lang-flag';
    flagSpan.setAttribute('aria-hidden', 'true');
    flagSpan.innerHTML = flag;
    const name = document.createElement('span');
    name.className = 'nav-lang-country-name';
    name.textContent = country.toUpperCase();
    head.append(flagSpan, name);

    const opts = document.createElement('div');
    opts.className = 'nav-lang-options';
    options.forEach((opt, i) => {
      const a = document.createElement('a');
      a.href = opt.path;
      a.textContent = opt.label;
      // Mark the site's current locale as active/current.
      if (opt.path === '/us/en') a.setAttribute('aria-current', 'true');
      opts.append(a);
      if (i < options.length - 1) {
        const sep = document.createElement('span');
        sep.className = 'nav-lang-sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '|';
        opts.append(sep);
      }
    });

    li.append(head, opts);
    list.append(li);
  });
  panel.append(list);
  langItem.append(panel);

  const setOpen = (open) => {
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    langItem.classList.toggle('nav-lang-open', open);
  };

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    setOpen(panel.hidden);
  });

  // Close on outside click or Escape.
  document.addEventListener('click', (e) => {
    if (!langItem.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') setOpen(false);
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // nav.md sections, in order: brand | sections (menu) | tools (search) | utility
  const classes = ['brand', 'sections', 'tools', 'utility'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand && navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // Build a functional search input from the "Search" link in the tools section.
  // Content-first: the fragment carries the "Search" label; the input is built here.
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const searchLink = [...navTools.querySelectorAll('a')].find((a) => /search/i.test(a.textContent));
    if (searchLink) {
      const form = document.createElement('form');
      form.className = 'nav-search';
      form.setAttribute('role', 'search');
      form.action = '/us/en/search';
      form.innerHTML = `
        <span class="nav-search-icon" aria-hidden="true"></span>
        <input type="search" name="q" aria-label="Search" placeholder="Search">
      `;
      // Replace the search link's wrapper with the form. If the link sat in a
      // list item, don't leave a <form> as a bare child of <ul> (invalid list
      // markup / a11y "list" failure): drop the whole <ul> when search is its
      // only item, otherwise swap just the <li>'s contents.
      const listItem = searchLink.closest('li');
      if (listItem) {
        const list = listItem.closest('ul, ol');
        if (list && list.children.length === 1) {
          list.replaceWith(form);
        } else {
          listItem.replaceChildren(form);
        }
      } else {
        searchLink.closest('p')?.replaceWith(form);
      }
      // if the link sat in a bare wrapper, ensure the form is in the tools section
      if (!navTools.contains(form)) navTools.append(form);
    }
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  // Two-tier layout: a dark utility top bar above the white main row.
  // The utility section (sign-in + locale) moves into the top bar; brand + menu
  // + search stay in the main row.
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  const navUtility = nav.querySelector('.nav-utility');
  if (navUtility) {
    decorateLangSwitcher(navUtility);
    const topBar = document.createElement('div');
    topBar.className = 'nav-utility-bar';
    const topBarInner = document.createElement('div');
    topBarInner.className = 'nav-utility-inner';
    topBarInner.append(navUtility);
    topBar.append(topBarInner);
    navWrapper.append(topBar);
  }

  navWrapper.append(nav);
  block.append(navWrapper);

  // Shrink the sticky header on scroll (matches WKND): once the page is scrolled
  // past a threshold the utility bar hides and the main row compacts; scrolling
  // back to the top restores the full header. Desktop only (mobile nav differs).
  // The CSS targets the <header class="header-wrapper"> element (the sticky
  // ancestor), not the inner block, so toggle the class there.
  const headerEl = block.closest('header') || block;
  const SHRINK_ON = 80;
  const SHRINK_OFF = 20;
  let shrunk = false;
  const updateShrink = () => {
    if (!isDesktop.matches) {
      if (shrunk) { headerEl.classList.remove('header-shrink'); shrunk = false; }
      return;
    }
    const y = window.scrollY;
    if (!shrunk && y > SHRINK_ON) {
      headerEl.classList.add('header-shrink');
      shrunk = true;
    } else if (shrunk && y < SHRINK_OFF) {
      headerEl.classList.remove('header-shrink');
      shrunk = false;
    }
  };
  window.addEventListener('scroll', updateShrink, { passive: true });
  updateShrink();
}
