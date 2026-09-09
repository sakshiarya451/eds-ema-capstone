/**
 * Breadcrumbs block.
 * Content model: a single list of links (the trail), authored in the doc.
 * Renders a semantic <nav><ol> breadcrumb trail; the last item is the current
 * page (not a link). Self-contained — no cross-block imports beyond none.
 */
const TITLE_CASE = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Build the ancestor trail from the current URL path when the authored trail
 * is missing parents. e.g. /us/en/adventures/bali-surf-camp →
 * [{Adventures, /us/en/adventures}]. Excludes the locale prefix and the
 * current page (added separately as the active crumb).
 */
function ancestorsFromPath() {
  const segs = window.location.pathname.replace(/\.html$/, '').split('/').filter(Boolean);
  // drop locale (first two segments, e.g. us/en) and the current page (last)
  const parents = segs.slice(2, -1);
  let href = `/${segs.slice(0, 2).join('/')}`;
  return parents.map((seg) => {
    href += `/${seg}`;
    return { label: TITLE_CASE(seg), href };
  });
}

export default function decorate(block) {
  const links = [...block.querySelectorAll('a')];
  let items = links.length
    ? links.map((a) => ({ label: a.textContent.trim(), href: a.getAttribute('href') }))
    : [...block.querySelectorAll('li, p, div')].map((el) => ({ label: el.textContent.trim(), href: null })).filter((i) => i.label);

  // If the authored trail only carries the current page (parents were lost in
  // import), reconstruct the ancestor links from the URL path.
  const current = items[items.length - 1] || { label: document.title, href: null };
  const hasParents = items.some((i) => i.href);
  if (!hasParents) {
    items = [...ancestorsFromPath(), { label: current.label, href: null }];
  }

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');
  ol.className = 'breadcrumbs-list';

  items.forEach((item, i) => {
    const li = document.createElement('li');
    const isLast = i === items.length - 1;
    if (item.href && !isLast) {
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      li.append(a);
    } else {
      li.textContent = item.label;
      li.setAttribute('aria-current', 'page');
    }
    ol.append(li);
  });

  nav.append(ol);
  block.replaceChildren(nav);
}
