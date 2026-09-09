/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel.js
  function parse(element, { document: document2 }) {
    let slides = Array.from(element.querySelectorAll(":scope .cmp-carousel__item"));
    if (!slides.length) {
      slides = Array.from(element.querySelectorAll(":scope .cmp-teaser"));
    }
    const cells = [];
    slides.forEach((slide) => {
      const image = slide.querySelector(".cmp-teaser__image img, .cmp-image img, img");
      const title = slide.querySelector(".cmp-teaser__title, h1, h2, h3");
      const description = slide.querySelector('.cmp-teaser__description, [class*="description"]');
      const ctaLinks = Array.from(
        slide.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a, a.button")
      );
      if (!image && !title && !description && !ctaLinks.length) return;
      const textCell = [];
      if (title) textCell.push(title);
      if (description) textCell.push(description);
      ctaLinks.forEach((a) => {
        const strong = document2.createElement("strong");
        const em = document2.createElement("em");
        em.append(a.cloneNode(true));
        strong.append(em);
        const p = document2.createElement("p");
        p.append(strong);
        textCell.push(p);
      });
      cells.push([image || "", textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse2(element, { document: document2 }) {
    const eyebrow = element.querySelector('.cmp-teaser__pretitle, [class*="pretitle"]');
    const heading = element.querySelector(".cmp-teaser__title, h1, h2, h3");
    const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
    const ctaLinks = Array.from(
      element.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a, a.button")
    );
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    const textCell = [];
    if (eyebrow) textCell.push(eyebrow);
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);
    ctaLinks.forEach((a) => {
      const strong = document2.createElement("strong");
      const em = document2.createElement("em");
      em.append(a.cloneNode(true));
      strong.append(em);
      const p = document2.createElement("p");
      p.append(strong);
      textCell.push(p);
    });
    if (!textCell.length && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const imageCell = image || "";
    const isFeatured = element.matches(".cmp-teaser--featured") || !!element.querySelector(".cmp-teaser--featured");
    const row = isFeatured ? [imageCell, textCell] : [textCell, imageCell];
    const cells = [row];
    const name = isFeatured ? "columns (featured)" : "columns";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse3(element, { document: document2 }) {
    let items = Array.from(element.querySelectorAll(":scope > .cmp-image-list__item"));
    if (!items.length) items = Array.from(element.querySelectorAll(".cmp-image-list__item"));
    if (!items.length) items = Array.from(element.querySelectorAll(":scope > li"));
    const cells = [];
    items.forEach((item) => {
      const image = item.querySelector(".cmp-image-list__item-image img, .cmp-image img, img");
      const titleLink = item.querySelector("a.cmp-image-list__item-title-link");
      const titleSpan = item.querySelector(".cmp-image-list__item-title");
      const imageLink = item.querySelector("a.cmp-image-list__item-image-link");
      const cardHref = titleLink && titleLink.getAttribute("href") || imageLink && imageLink.getAttribute("href");
      const description = item.querySelector('.cmp-image-list__item-description, [class*="description"], p');
      const textCell = [];
      const titleText = titleSpan && titleSpan.textContent.trim() || titleLink && titleLink.textContent.trim();
      if (titleText) {
        const heading = document2.createElement("h3");
        if (cardHref) {
          const a = document2.createElement("a");
          a.setAttribute("href", cardHref);
          a.textContent = titleText;
          heading.append(a);
        } else {
          heading.textContent = titleText;
        }
        textCell.push(heading);
      }
      if (description) {
        const p = document2.createElement("p");
        p.textContent = description.textContent.trim();
        textCell.push(p);
      }
      if (!image && !textCell.length) return;
      cells.push([image || "", textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", cells });
    element.replaceWith(block);
  }

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

  // tools/importer/transformers/wknd-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    carousel: parse,
    columns: parse2,
    cards: parse3
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "WKND homepage: carousel, featured columns, recent-articles cards, climbing columns, adventures cards",
    urls: [
      "https://wknd.site/us/en.html"
    ],
    blocks: [
      {
        name: "carousel",
        instances: [
          "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.carousel.panelcontainer.cmp-carousel--hero.aem-GridColumn.aem-GridColumn--default--12"
        ]
      },
      {
        name: "columns",
        instances: [
          "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(1) > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.teaser.cmp-teaser--featured.aem-GridColumn.aem-GridColumn--default--12",
          "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.teaser.cmp-teaser--hero.cmp-teaser--imagebottom.aem-GridColumn.aem-GridColumn--default--12"
        ]
      },
      {
        name: "cards",
        instances: [
          "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(1) > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.image-list.list.aem-GridColumn.aem-GridColumn--default--12 ul.cmp-image-list",
          "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.image-list.list.aem-GridColumn.aem-GridColumn--default--12 ul.cmp-image-list"
        ]
      }
    ],
    sections: [
      { id: "s1-carousel", name: "Hero Carousel", style: null, blocks: ["carousel"], defaultContent: [] },
      { id: "s2-featured", name: "Featured Article (Columns)", style: null, blocks: ["columns"], defaultContent: [] },
      { id: "s3-recent", name: "Recent Articles (Cards + Button)", style: null, blocks: ["cards"], defaultContent: [] },
      { id: "s4-climbing", name: "Climbing New Zealand (Columns)", style: null, blocks: ["columns"], defaultContent: [] },
      { id: "s5-whereto", name: "Where do you want to go? (Cards + Button)", style: null, blocks: ["cards"], defaultContent: [] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const insertBreakBefore = (node) => {
        if (node && node.parentNode) node.before(document2.createElement("hr"));
      };
      const findHeading = (re) => [...main.querySelectorAll("h2, h3")].find((h) => re.test(h.textContent));
      const findTopChildWith = (re) => {
        const el = [...main.querySelectorAll("*")].find((n) => re.test(n.textContent) && ![...n.children].some((c) => re.test(c.textContent)));
        if (!el) return null;
        let node = el;
        while (node && node.parentElement !== main) node = node.parentElement;
        return node;
      };
      const featuredHeadCell = [...main.querySelectorAll("table td, table th")].find((c) => /Camping in Western Australia/i.test(c.textContent));
      const featuredTable = featuredHeadCell ? featuredHeadCell.closest("table") : null;
      insertBreakBefore(featuredTable);
      insertBreakBefore(findHeading(/recent articles/i));
      insertBreakBefore(findHeading(/next adventures/i));
      insertBreakBefore(findHeading(/where do you want to go/i));
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      const metaTable = [...main.querySelectorAll("table")].find((t) => {
        const first = t.querySelector("tr td, tr th");
        return first && /^metadata$/i.test(first.textContent.trim());
      });
      if (metaTable) {
        const tr = document2.createElement("tr");
        const k = document2.createElement("td");
        k.textContent = "Template";
        const v = document2.createElement("td");
        v.textContent = PAGE_TEMPLATE.name;
        tr.append(k, v);
        (metaTable.querySelector("tbody") || metaTable).append(tr);
      }
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
