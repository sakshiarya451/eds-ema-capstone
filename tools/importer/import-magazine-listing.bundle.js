var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-magazine-listing.js
  var import_magazine_listing_exports = {};
  __export(import_magazine_listing_exports, {
    default: () => import_magazine_listing_default
  });

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#destination_publishing_iframe_wkndsite_0",
        "iframe"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.experiencefragment.cmp-experiencefragment--header",
        "footer.experiencefragment.cmp-experiencefragment--footer",
        "#toggleNav",
        "#mobileNav"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "meta",
        "noscript"
      ]);
      element.querySelectorAll("[data-cmp-data-layer]").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer");
      });
      element.querySelectorAll("[data-cmp-hook-image]").forEach((el) => {
        el.removeAttribute("data-cmp-hook-image");
      });
      const doc = element.ownerDocument;
      element.querySelectorAll("a.cmp-button[href]").forEach((a) => {
        if (a.closest("strong") || a.closest("em")) return;
        const label = a.textContent.trim();
        if (!label) return;
        a.textContent = label;
        const strong = doc.createElement("strong");
        const em = doc.createElement("em");
        em.append(a.cloneNode(true));
        strong.append(em);
        a.replaceWith(strong);
      });
    }
  }

  // tools/importer/import-magazine-listing.js
  var PAGE_TEMPLATE = {
    name: "magazine-listing",
    description: "Magazine listing: title, featured article, dynamic article grid, members-only section",
    urls: ["https://wknd.site/us/en/magazine.html"],
    blocks: []
  };
  var transformers = [transform];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function buildTeaserRow(document, teaserEl) {
    const h2 = teaserEl.querySelector(".cmp-teaser__title, h2, h3");
    const desc = teaserEl.querySelector('.cmp-teaser__description, [class*="description"], p');
    const cta = teaserEl.querySelector(".cmp-teaser__action-link, .cmp-teaser__action-container, a");
    const body = [];
    if (h2 && h2.textContent.trim()) {
      const h = document.createElement("h2");
      h.textContent = h2.textContent.trim();
      body.push(h);
    }
    if (desc && desc.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = desc.textContent.trim();
      body.push(p);
    }
    const ctaText = cta && cta.textContent.trim() || "Read More";
    const p2 = document.createElement("p");
    p2.textContent = ctaText;
    body.push(p2);
    let img = "";
    const cmpImg = teaserEl.querySelector(".cmp-image[data-cmp-src], [data-cmp-src]");
    const rawImg = teaserEl.querySelector("img");
    if (rawImg) {
      img = rawImg.cloneNode(true);
      if (cmpImg && cmpImg.getAttribute("data-cmp-src")) {
        const hi = cmpImg.getAttribute("data-cmp-src").replace("{.width}", ".1600");
        img.setAttribute("src", hi);
        img.removeAttribute("srcset");
      }
    }
    return [body, img];
  }
  var import_magazine_listing_default = {
    transform: (payload) => {
      const {
        document,
        url,
        params
      } = payload;
      const main = document.body;
      const featured = document.querySelector("main div.teaser.cmp-teaser--featured, main .cmp-teaser--featured");
      let featuredData = null;
      if (featured) {
        featuredData = {
          pretitle: (featured.querySelector(".cmp-teaser__pretitle") || {}).textContent || "",
          title: (featured.querySelector(".cmp-teaser__title") || {}).textContent || "",
          desc: (featured.querySelector(".cmp-teaser__description") || {}).textContent || "",
          href: (featured.querySelector(".cmp-teaser__action-link") || {}).getAttribute ? featured.querySelector(".cmp-teaser__action-link").getAttribute("href") : "",
          cta: (featured.querySelector(".cmp-teaser__action-link") || {}).textContent || "Read More",
          img: featured.querySelector(".cmp-teaser__image img, .cmp-image img, img")
        };
      }
      const membersText = [...document.querySelectorAll("main .text .cmp-text, main .cmp-text")].map((t) => t.textContent.trim()).find((t) => /sign in/i.test(t)) || "";
      const memberTeasers = [...document.querySelectorAll("main div.teaser")].filter((t) => !t.matches(".cmp-teaser--featured") && !t.querySelector(".cmp-teaser--featured"));
      executeTransformers("beforeTransform", main, payload);
      main.textContent = "";
      const addHr = () => main.appendChild(document.createElement("hr"));
      const addH = (level, text) => {
        const h = document.createElement(`h${level}`);
        h.textContent = text;
        main.appendChild(h);
      };
      addH(1, "Magazine");
      if (featuredData) {
        const textCell = [];
        if (featuredData.pretitle.trim()) {
          const p = document.createElement("p");
          p.textContent = featuredData.pretitle.trim();
          textCell.push(p);
        }
        if (featuredData.title.trim()) {
          const h = document.createElement("h2");
          h.textContent = featuredData.title.trim();
          textCell.push(h);
        }
        if (featuredData.desc.trim()) {
          const p = document.createElement("p");
          p.textContent = featuredData.desc.trim();
          textCell.push(p);
        }
        if (featuredData.href) {
          const a = document.createElement("a");
          a.setAttribute("href", featuredData.href);
          a.textContent = featuredData.cta.trim() || "Read More";
          const strong = document.createElement("strong");
          const em = document.createElement("em");
          em.append(a);
          strong.append(em);
          const p = document.createElement("p");
          p.append(strong);
          textCell.push(p);
        }
        addHr();
        const block = WebImporter.Blocks.createBlock(document, {
          name: "columns (featured)",
          cells: [[featuredData.img ? featuredData.img.cloneNode(true) : "", textCell]]
        });
        main.appendChild(block);
      }
      addHr();
      addH(2, "All Articles");
      const cardsBlock = WebImporter.Blocks.createBlock(document, {
        name: "cards (magazine)",
        cells: [[""]]
      });
      main.appendChild(cardsBlock);
      addHr();
      addH(2, "Members Only");
      if (membersText) {
        const p = document.createElement("p");
        p.textContent = membersText;
        main.appendChild(p);
      }
      addHr();
      const teaserRows = memberTeasers.map((t) => buildTeaserRow(document, t)).filter((row) => row[0].length);
      if (teaserRows.length) {
        const teasersBlock = WebImporter.Blocks.createBlock(document, {
          name: "teasers (members)",
          cells: teaserRows
        });
        main.appendChild(teasersBlock);
      }
      executeTransformers("afterTransform", main, payload);
      const hrEnd = document.createElement("hr");
      main.appendChild(hrEnd);
      WebImporter.rules.createMetadata(main, document);
      const metaTable = [...main.querySelectorAll("table")].find((t) => {
        const first = t.querySelector("tr td, tr th");
        return first && /^metadata$/i.test(first.textContent.trim());
      });
      if (metaTable) {
        const tr = document.createElement("tr");
        const k = document.createElement("td");
        k.textContent = "Template";
        const v = document.createElement("td");
        v.textContent = PAGE_TEMPLATE.name;
        tr.append(k, v);
        (metaTable.querySelector("tbody") || metaTable).append(tr);
      }
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: ["columns (featured)", "cards (magazine)", "teasers (members)"] }
      }];
    }
  };
  return __toCommonJS(import_magazine_listing_exports);
})();
