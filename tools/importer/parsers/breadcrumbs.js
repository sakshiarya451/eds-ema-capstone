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

  const cell = [];
  items.forEach((li) => {
    const link = li.querySelector('a');
    const label = (li.querySelector('span') || li).textContent.trim();
    if (!label) return;
    const a = document.createElement('a');
    a.textContent = label;
    a.href = link ? link.getAttribute('href') : '#';
    cell.push(a);
  });

  // Empty-block guard: nothing usable extracted.
  if (!cell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push([cell]); // 1-column: one row, one cell holding all trail links

  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumbs', cells });
  element.replaceWith(block);
}
