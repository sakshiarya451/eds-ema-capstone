/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the magazine-article two-column body band.
 * Base block: columns (reused; emitted as "columns (article)").
 * Source: https://wknd.site/us/en/magazine/arctic-surfing.html
 * Generated: 2026-09-09
 *
 * WKND renders the article body as a 2-column layout:
 *   LEFT  (main.container, ~8 cols): title (h1) + byline (h4) + the content
 *         fragment rich text (intro, blockquote, section headings, paragraphs,
 *         inline images) + a separator + the author bio (name h2, role p).
 *   RIGHT (aside.cmp-layoutcontainer--sidebar, ~3 cols): "SHARE THIS STORY"
 *         heading + the "up next" related-article list.
 *
 * `element` is the LEFT column (main.container matched by the template block
 * selector). The RIGHT column is its next element sibling (the <aside>). Both
 * are replaced by a single 2-cell columns block so the block-table roundtrip
 * preserves a faithful reading order.
 *
 * Dropped (non-editorial, consistent with the adventure-detail migration):
 *   - JS share widgets (Facebook/Pinterest button placeholders — no real href).
 *   - Author social icons (all point to "#", non-functional).
 */
export default function parse(element, { document }) {
  const aside = element.nextElementSibling; // the sidebar column

  // ---- LEFT column ------------------------------------------------------
  const left = [];

  // Title + byline live in the body column, OUTSIDE the content fragment.
  const h1 = element.querySelector('h1');
  if (h1) {
    const h = document.createElement('h1');
    h.textContent = h1.textContent.trim();
    left.push(h);
  }
  const byline = element.querySelector('h4');
  if (byline) {
    const h = document.createElement('h4');
    h.textContent = byline.textContent.trim();
    left.push(h);
  }

  // Content fragment rich text: collect content nodes in document order.
  const cf = element.querySelector('article.contentfragment, .cmp-contentfragment__elements');
  if (cf) {
    const nodes = cf.querySelectorAll('h2, h3, blockquote, p, img');
    nodes.forEach((node) => {
      // WKND injects a hidden .cmp-contentfragment__title (h3) that duplicates
      // the visible h1 headline — skip it so the title isn't emitted twice.
      if (node.matches('.cmp-contentfragment__title')) return;
      if (node.tagName === 'IMG') {
        // Keep the raw <img>; the importer localizes/adjusts its src later.
        left.push(node.cloneNode(true));
        return;
      }
      if (node.tagName === 'P' && !node.textContent.trim() && !node.querySelector('img')) {
        return; // skip empty spacer paragraphs
      }
      // Preserve the tag but strip AEM classes/attributes.
      const clone = document.createElement(node.tagName.toLowerCase());
      clone.innerHTML = node.innerHTML;
      if (clone.textContent.trim() || clone.querySelector('img')) left.push(clone);
    });
  }

  // Author bio (experience fragment): separator + avatar + name + role.
  const authorXf = element.querySelector('.experiencefragment, .cmp-experiencefragment');
  if (authorXf) {
    const name = authorXf.querySelector('h2, h3');
    const role = authorXf.querySelector('p');
    const avatar = authorXf.querySelector('img');
    if (name && name.textContent.trim()) {
      left.push(document.createElement('hr'));
      if (avatar) left.push(avatar.cloneNode(true));
      const h = document.createElement('h2');
      h.textContent = name.textContent.trim();
      left.push(h);
      if (role && role.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = role.textContent.trim();
        left.push(p);
      }
    }
  }

  // ---- RIGHT column (sidebar) ------------------------------------------
  const right = [];
  if (aside) {
    // "SHARE THIS STORY" heading.
    const shareHeading = aside.querySelector('.title h5, h5');
    if (shareHeading && shareHeading.textContent.trim()) {
      const h = document.createElement('h5');
      h.textContent = shareHeading.textContent.trim();
      right.push(h);
    }

    // "Up next" related-article list. Each item: title link + date.
    const items = aside.querySelectorAll('.cmp-list__item, li');
    if (items.length) {
      const ul = document.createElement('ul');
      items.forEach((li) => {
        const link = li.querySelector('a[href]');
        if (!link) return;
        const title = (li.querySelector('.cmp-list__item-title') || link).textContent.trim();
        const date = (li.querySelector('.cmp-list__item-date') || {}).textContent || '';
        if (!title) return;
        const outLi = document.createElement('li');
        const a = document.createElement('a');
        a.setAttribute('href', link.getAttribute('href'));
        a.textContent = title;
        outLi.append(a);
        if (date.trim()) {
          outLi.append(document.createElement('br'));
          const dateSpan = document.createElement('em');
          dateSpan.textContent = date.trim();
          outLi.append(dateSpan);
        }
        ul.append(outLi);
      });
      if (ul.children.length) right.push(ul);
    }
  }

  // Empty-block guard.
  if (!left.length && !right.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[left, right]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns (article)', cells });

  // Replace the left column with the block, then drop the now-merged aside.
  element.replaceWith(block);
  if (aside && aside.parentNode) aside.remove();
}
