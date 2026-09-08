/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns
 * Base block: columns
 * Source: https://wknd.site/us/en.html
 *   Instance 1: .teaser.cmp-teaser--featured  (Featured Article) -> [ image | text ]
 *   Instance 2: .teaser.cmp-teaser--hero.cmp-teaser--imagebottom (Climbing NZ) -> [ text | image ]
 * Generated: 2026-09-07
 *
 * Structure (from library-description.txt): multiple columns/rows.
 * First row = block name (handled by createBlock).
 * Second row = the columns for this instance. This is a 2-column layout with one
 * content cell (eyebrow + heading + body + CTA) and one image cell; left/right
 * order depends on the teaser variant.
 */
export default function parse(element, { document }) {
  // Text content pieces.
  const eyebrow = element.querySelector('.cmp-teaser__pretitle, [class*="pretitle"]');
  const heading = element.querySelector('.cmp-teaser__title, h1, h2, h3');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a.button'),
  );

  // Image.
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Build the text column.
  const textCell = [];
  if (eyebrow) textCell.push(eyebrow);
  if (heading) textCell.push(heading);
  if (description) textCell.push(description);
  textCell.push(...ctaLinks);

  // Empty-block guard.
  if (!textCell.length && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const imageCell = image || '';

  // Preserve per-instance left/right order.
  // Featured teaser: image on the left. Others (hero): text on the left.
  const isFeatured = element.matches('.cmp-teaser--featured')
    || !!element.querySelector('.cmp-teaser--featured');

  const row = isFeatured ? [imageCell, textCell] : [textCell, imageCell];

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
