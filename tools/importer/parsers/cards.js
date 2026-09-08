/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards
 * Base block: cards
 * Source: https://wknd.site/us/en.html (ul.cmp-image-list with cmp-image-list__item entries)
 * Generated: 2026-09-07
 *
 * Structure (from library-description.txt): 2 columns, multiple rows.
 * First row = block name (handled by createBlock).
 * Each subsequent row = one card: [ image | text (title + description) ].
 * The whole card links to an article/adventure page — the title is wrapped in a
 * link, which is preserved so the card remains clickable.
 */
export default function parse(element, { document }) {
  // Each card is a list item. Fallback to article wrapper for cross-page variation.
  let items = Array.from(element.querySelectorAll(':scope > .cmp-image-list__item'));
  if (!items.length) items = Array.from(element.querySelectorAll('.cmp-image-list__item'));
  if (!items.length) items = Array.from(element.querySelectorAll(':scope > li'));

  const cells = [];

  items.forEach((item) => {
    // Image (mandatory) — first cell.
    const image = item.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');

    // Title — preserve the link so the card remains clickable.
    const titleLink = item.querySelector('a.cmp-image-list__item-title-link');
    const titleSpan = item.querySelector('.cmp-image-list__item-title');
    const imageLink = item.querySelector('a.cmp-image-list__item-image-link');
    const cardHref = (titleLink && titleLink.getAttribute('href'))
      || (imageLink && imageLink.getAttribute('href'));

    // Description.
    const description = item.querySelector('.cmp-image-list__item-description, [class*="description"], p');

    const textCell = [];

    // Build a heading link: <h3><a href>title</a></h3> to preserve semantics + link.
    const titleText = (titleSpan && titleSpan.textContent.trim())
      || (titleLink && titleLink.textContent.trim());
    if (titleText) {
      const heading = document.createElement('h3');
      if (cardHref) {
        const a = document.createElement('a');
        a.setAttribute('href', cardHref);
        a.textContent = titleText;
        heading.append(a);
      } else {
        heading.textContent = titleText;
      }
      textCell.push(heading);
    }

    if (description) {
      // Normalize span/other inline description into a paragraph.
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      textCell.push(p);
    }

    // Skip empty cards (cross-page resilience).
    if (!image && !textCell.length) return;

    cells.push([image || '', textCell]);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
