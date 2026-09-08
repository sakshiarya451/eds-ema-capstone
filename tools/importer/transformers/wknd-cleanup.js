/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 *
 * All selectors below were verified by reading migration-work/cleaned.html.
 * Goal: emit ONLY the <main> body content (the 5 authorable homepage sections).
 * The global header and footer are already migrated as GLOBAL fragments
 * (/nav and /footer), so they MUST be dropped here to avoid duplicating them
 * on every imported page.
 *
 * Deliberately NOT touched:
 *  - aem-Grid / cmp-container wrapper divs: block + section selectors in
 *    page-templates.json depend on them; removing them would break parsing.
 *  - <img> tags and their src attributes: the scraper localized images and the
 *    import rewrites src to content/images/. Left intact.
 *  - bare <hr>: the section transformer (wknd-sections.js) inserts section
 *    breaks as bare <hr>; only the site's own wrapped separators are removed.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Adobe ID / Demdex syncing iframe injected by the site shell (cleaned.html line 566).
    // Removed before parsing so it can never leak into a block cell.
    WebImporter.DOMUtils.remove(element, [
      '#destination_publishing_iframe_wkndsite_0',
      'iframe',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome — verified in cleaned.html:
    //  - header.experiencefragment.cmp-experiencefragment--header (line 5): global nav XF (=> /nav)
    //  - footer.experiencefragment.cmp-experiencefragment--footer (line 471): global footer XF (=> /footer)
    //  - #toggleNav (line 568) / #mobileNav (line 574): mobile navigation toggle + drawer
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment.cmp-experiencefragment--header',
      'footer.experiencefragment.cmp-experiencefragment--footer',
      '#toggleNav',
      '#mobileNav',
    ]);

    // AEM scaffolding noise: empty <meta> tags emitted inside cmp-image blocks
    // (e.g. cleaned.html lines 183, 204, 227, 271, 334). Not authorable content.
    WebImporter.DOMUtils.remove(element, [
      'meta',
      'noscript',
    ]);

    // Strip AEM data-layer / analytics tracking attributes left on elements.
    element.querySelectorAll('[data-cmp-data-layer]').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer');
    });
    element.querySelectorAll('[data-cmp-hook-image]').forEach((el) => {
      el.removeAttribute('data-cmp-hook-image');
    });

    // Standalone list CTAs ("All Articles", "All Trips") are default content
    // (not produced by a block parser). In the SOURCE they are AEM buttons
    // (a.cmp-button), still present at afterTransform time. Wrap each in
    // <strong><em> so EDS decorateButtons renders it as the WKND yellow accent
    // button (md conversion turns this into ***[text](href)***). Idempotent:
    // skip anchors already wrapped.
    const doc = element.ownerDocument;
    element.querySelectorAll('a.cmp-button[href]').forEach((a) => {
      if (a.closest('strong') || a.closest('em')) return; // already wrapped
      // normalize the label: source nests text in <span class="cmp-button__text">
      const label = a.textContent.trim();
      if (!label) return;
      a.textContent = label;
      const strong = doc.createElement('strong');
      const em = doc.createElement('em');
      em.append(a.cloneNode(true));
      strong.append(em);
      a.replaceWith(strong);
    });
  }
}
