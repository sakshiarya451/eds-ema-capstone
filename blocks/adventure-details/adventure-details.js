/**
 * Adventure Details block.
 * Content model: each row is a spec — cell 1 = label (e.g. "Trip Length"),
 * cell 2 = value (e.g. "6 Days"). Renders a labelled spec grid matching WKND's
 * adventure content-fragment element list. Self-contained.
 */
export default function decorate(block) {
  const dl = document.createElement('dl');
  dl.className = 'adventure-details-list';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const label = cells[0] ? cells[0].textContent.trim() : '';
    const value = cells[1] ? cells[1].textContent.trim() : '';
    if (!label && !value) return;

    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    dl.append(dt, dd);
  });

  block.replaceChildren(dl);
}
