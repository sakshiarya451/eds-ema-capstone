/* eslint-disable */
/* global WebImporter */
/**
 * Parser for adventure-details.
 * Base block: adventure.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Generated: 2026-09-09
 *
 * Model: 2 columns; each row is a spec — cell 1 = label, cell 2 = value.
 * The block reads each row's children: children[0]=label, children[1]=value.
 * Source is a <dl class="cmp-contentfragment__elements"> with entries
 * .cmp-contentfragment__element, each containing
 * .cmp-contentfragment__element-title (label) and
 * .cmp-contentfragment__element-value (value).
 * Emits one row per spec (Activity, Adventure Type, Trip Length, Group Size,
 * Difficulty, Price).
 */
export default function parse(element, { document }) {
  const elements = [...element.querySelectorAll('.cmp-contentfragment__element')];

  const cells = [];
  elements.forEach((el) => {
    const titleEl = el.querySelector('.cmp-contentfragment__element-title, dt');
    const valueEl = el.querySelector('.cmp-contentfragment__element-value, dd');
    const label = titleEl ? titleEl.textContent.trim() : '';
    let value = valueEl ? valueEl.textContent.trim() : '';
    // Price comes from the content fragment as a raw number (e.g. "5000.0").
    // Format it as a currency string to match WKND ("$5,000").
    if (/price/i.test(label)) {
      const num = parseFloat(value.replace(/[^0-9.]/g, ''));
      if (!Number.isNaN(num)) value = `$${Math.round(num).toLocaleString('en-US')}`;
    }
    if (!label && !value) return;
    cells.push([label, value]);
  });

  // Empty-block guard: no specs found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'adventure-details', cells });
  element.replaceWith(block);
}
