import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * "Members Only" locked teasers (magazine listing). Each authored row is one
 * teaser: cell 1 = body (title + description + "Read More" label), cell 2 = the
 * teaser image. WKND renders these 2-up: a lock badge + title + description +
 * grey "Read More" button above a large image. The content is member-gated on
 * WKND (no working link), so the CTA is a non-navigating styled label.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const li = document.createElement('li');
    li.className = 'teasers-card';

    // Image cell = the one holding a picture/img; body = everything else.
    const imgCell = cells.find((c) => c.querySelector('picture, img'));
    const bodyCells = cells.filter((c) => c !== imgCell);

    const body = document.createElement('div');
    body.className = 'teasers-card-body';

    // Lock badge (WKND marks secure teasers with a lock icon above the title).
    const lock = document.createElement('span');
    lock.className = 'teasers-card-lock';
    lock.setAttribute('aria-hidden', 'true');
    lock.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 0 1 6 0v3z"/></svg>';
    body.append(lock);

    // Move authored body content (title, description, CTA) into the card body.
    bodyCells.forEach((c) => { while (c.firstChild) body.append(c.firstChild); });

    // Turn the trailing "Read More" paragraph into a grey button-styled label.
    const ps = [...body.querySelectorAll('p')];
    const cta = ps.reverse().find((p) => /read more/i.test(p.textContent.trim()));
    if (cta) {
      const span = document.createElement('span');
      span.className = 'teasers-card-cta';
      span.textContent = cta.textContent.trim();
      cta.replaceWith(span);
    }

    li.append(body);

    // Image below the body.
    if (imgCell) {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'teasers-card-image';
      const img = imgCell.querySelector('img');
      if (img) {
        imageDiv.append(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]));
      }
      li.append(imageDiv);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
