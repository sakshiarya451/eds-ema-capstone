/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: carousel
 * Base block: carousel
 * Source: https://wknd.site/us/en.html (cmp-carousel--hero)
 * Generated: 2026-09-07
 *
 * Structure (from library-description.txt): 2 columns, multiple rows.
 * First row = block name (handled by createBlock).
 * Each subsequent row = one slide: [ image | text (title + description + CTA) ].
 * Source: each slide is a `.cmp-carousel__item` containing a `.cmp-teaser`.
 */
export default function parse(element, { document }) {
  // Each slide in the source is a carousel item.
  // Fallback to the teaser wrapper in case item classes vary across pages.
  let slides = Array.from(element.querySelectorAll(':scope .cmp-carousel__item'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll(':scope .cmp-teaser'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // Image (mandatory) — first cell of the row, no other content.
    const image = slide.querySelector('.cmp-teaser__image img, .cmp-image img, img');

    // Text content (optional) — second cell: title + description + CTA.
    const title = slide.querySelector('.cmp-teaser__title, h1, h2, h3');
    const description = slide.querySelector('.cmp-teaser__description, [class*="description"]');
    const ctaLinks = Array.from(
      slide.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a.button'),
    );

    // Skip empty slides (cross-page resilience).
    if (!image && !title && !description && !ctaLinks.length) return;

    const textCell = [];
    if (title) textCell.push(title);
    if (description) textCell.push(description);
    textCell.push(...ctaLinks);

    cells.push([image || '', textCell]);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
