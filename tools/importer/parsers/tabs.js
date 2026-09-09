/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs.
 * Base block: tabs.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Generated: 2026-09-09
 *
 * Model: 2 columns; each row is one tab — cell 1 = tab label, cell 2 = panel
 * content. The block reads each child row's first cell as the tab label and the
 * remaining cell as the tabpanel content.
 * Source is <div class="cmp-tabs"> with an <ol class="cmp-tabs__tablist"> of
 * <li class="cmp-tabs__tab"> labels (Overview, Itinerary, What to Bring) and
 * matching <div class="cmp-tabs__tabpanel"> panels. Panels wrap their body in
 * .cmp-contentfragment__elements — we lift that inner content and preserve
 * headings, paragraphs, images, lists and links.
 */
export default function parse(element, { document }) {
  const tabsRoot = element.querySelector('.cmp-tabs') || element;
  const labels = [...tabsRoot.querySelectorAll(':scope > .cmp-tabs__tablist > .cmp-tabs__tab, .cmp-tabs__tablist > li')];
  const panels = [...tabsRoot.querySelectorAll(':scope > .cmp-tabs__tabpanel, .cmp-tabs__tabpanel')];

  const cells = [];
  labels.forEach((labelEl, i) => {
    const label = labelEl.textContent.trim();
    const panel = panels[i];

    // Prefer the content-fragment element body; fall back to the whole panel.
    const content = panel
      ? (panel.querySelector('.cmp-contentfragment__elements') || panel)
      : null;

    if (!label && !content) return;
    cells.push([label, content || '']);
  });

  // Empty-block guard: no tabs found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
