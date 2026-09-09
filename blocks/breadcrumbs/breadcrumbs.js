/**
 * Breadcrumbs block.
 * Content model: a single list of links (the trail), authored in the doc.
 * Renders a semantic <nav><ol> breadcrumb trail; the last item is the current
 * page (not a link). Self-contained — no cross-block imports beyond none.
 */
export default function decorate(block) {
  const links = [...block.querySelectorAll('a')];
  const items = links.length
    ? links.map((a) => ({ label: a.textContent.trim(), href: a.getAttribute('href') }))
    : [...block.querySelectorAll('li, p')].map((el) => ({ label: el.textContent.trim(), href: null }));

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
