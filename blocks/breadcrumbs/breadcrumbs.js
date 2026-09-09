/**
 * Breadcrumbs block.
 * Content model: a single list of links (the trail), authored in the doc.
 * Renders a semantic <nav><ol> breadcrumb trail; the last item is the current
 * page (not a link). Self-contained — no cross-block imports beyond none.
 */
const TITLE_CASE = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Build the full breadcrumb trail deterministically from the URL path.
 * e.g. /us/en/adventures/bali-surf-camp →
 *   [{Adventures, /us/en/adventures}, {Bali Surf Camp, null (current)}].
 * The locale prefix (first two segments, e.g. us/en) is excluded. The current
 * page (last segment) is the active crumb with no link.
 *
 * The trail is derived from the path rather than the imported crumbs because
 * the bulk-import md pipeline handles the source breadcrumb inconsistently
 * (sometimes dropping the parent, sometimes duplicating it). The path is the
 * single source of truth and is correct for every adventure page.
 */
function trailFromPath(currentLabel) {
  const segs = window.location.pathname.replace(/\.html$/, '').split('/').filter(Boolean);
  const rest = segs.slice(2); // drop locale (us/en)
  let href = `/${segs.slice(0, 2).join('/')}`;
  return rest.map((seg, i) => {
    href += `/${seg}`;
    const isLast = i === rest.length - 1;
    return {
      // current crumb: use the provided label if any, else the title-cased
      // URL segment (matches WKND's page navigation title).
      label: isLast ? (currentLabel || TITLE_CASE(seg)) : TITLE_CASE(seg),
      href: isLast ? null : href,
    };
  });
}

export default function decorate(block) {
  // WKND's breadcrumb current crumb is the page's navigation title — i.e. the
  // title-cased last URL segment (e.g. "Arctic Surfing"), NOT the on-page h1
  // headline (which can differ, e.g. "Aloha Spirits in Northern Norway").
  // trailFromPath derives that from the path; passing null lets it title-case
  // the segment. Authored crumbs / h1 are ignored so the trail is deterministic.
  const items = trailFromPath(null);

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
