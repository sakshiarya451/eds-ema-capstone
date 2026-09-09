/* eslint-disable */
/* global WebImporter */
/**
 * Parser for breadcrumbs.
 * Base block: breadcrumbs.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Generated: 2026-09-09
 *
 * Model: single 1-column cell holding the ordered trail of links/labels.
 * The breadcrumbs block reads block.querySelectorAll('a') for the trail and
 * treats the LAST item as the current page (rendered as text, not a link).
 * Source is a <nav class="cmp-breadcrumb"> with <li class="cmp-breadcrumb__item">
 * entries; the active/current item (cmp-breadcrumb__item--active) has no <a>,
 * so we synthesize an anchor for it (href is cosmetic — the block renders the
 * last item as plain text regardless of href).
 */
export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.cmp-breadcrumb__item, li')];

  // Each crumb becomes its OWN row (single cell) so every trail item survives
  // the block-table → markdown → HTML roundtrip. Linked crumbs render as <a>;
  // the current/active crumb (no href) renders as plain text — avoiding two
  // adjacent <a href="#"> anchors that the md pipeline can collapse.
  const cells = [];
  items.forEach((li) => {
    const link = li.querySelector('a');
    const label = (li.querySelector('span') || li).textContent.trim();
    if (!label) return;
    if (link && link.getAttribute('href')) {
      const a = document.createElement('a');
      a.textContent = label;
      a.href = link.getAttribute('href');
      cells.push([a]);
    } else {
      cells.push([label]); // current page — plain text, no anchor
    }
  });

  // Empty-block guard: nothing usable extracted.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumbs', cells });
  element.replaceWith(block);
}
