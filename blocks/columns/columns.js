import { decorateBlock, loadBlock } from '../../scripts/aem.js';

/**
 * Convert a nested block table (a block authored inside a columns cell) into a
 * proper block element and decorate/load it. EDS only auto-decorates blocks
 * that are direct children of a section, so a block nested inside columns
 * (e.g. the FAQ accordion) arrives here as a raw <table> and must be
 * decorated manually.
 */
function decorateNestedBlocks(block) {
  block.querySelectorAll(':scope table').forEach((table) => {
    const head = table.querySelector('thead th, thead td, tr th');
    const blockName = (head ? head.textContent : '').trim().toLowerCase();
    if (!blockName) return;

    const wrapper = document.createElement('div');
    wrapper.className = blockName;
    const bodyRows = table.querySelectorAll('tbody tr');
    const rows = bodyRows.length ? bodyRows : table.querySelectorAll('tr');
    rows.forEach((tr) => {
      // skip the header row if we fell back to all rows
      if (tr.querySelector('th') && tr.closest('thead')) return;
      const row = document.createElement('div');
      [...tr.children].forEach((td) => {
        const cell = document.createElement('div');
        cell.append(...td.childNodes);
        row.append(cell);
      });
      wrapper.append(row);
    });

    table.replaceWith(wrapper);
    decorateBlock(wrapper);
    loadBlock(wrapper);
  });
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // decorate any block nested inside a column (e.g. FAQ accordion). Scoped to
  // the faq variant so article/featured body tables are never touched.
  if (block.classList.contains('faq')) decorateNestedBlocks(block);
}
