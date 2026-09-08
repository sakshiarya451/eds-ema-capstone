/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND section breaks + section metadata.
 *
 * Uses payload.template.sections (DOM-verified selectors from page analysis).
 * The homepage template has 5 sections, so this inserts a section break <hr>
 * before every section except the first (expected: 4 breaks). None of the WKND
 * homepage sections carry a `style`, so no Section Metadata blocks are emitted;
 * the metadata logic is retained for correctness should a styled section appear.
 *
 * Breaks are inserted in beforeTransform (while every section element still
 * exists), using a temporary marker attribute as a stable anchor. Metadata is
 * inserted in afterTransform. Sections are processed in reverse so inserts
 * never disturb selectors for sections not yet processed. See
 * references/generate-import-transformer.md ("Why both hooks").
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove();
      }
    }
  }
}
