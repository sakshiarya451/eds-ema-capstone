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

  // tools/importer/import-adventure-detail.js
  var import_adventure_detail_exports = {};
  __export(import_adventure_detail_exports, {
    default: () => import_adventure_detail_default
  });

  // tools/importer/parsers/breadcrumbs.js
  function parse(element, { document: document2 }) {
    const items = [...element.querySelectorAll(".cmp-breadcrumb__item, li")];
    const cells = [];
    items.forEach((li) => {
      const link = li.querySelector("a");
      const label = (li.querySelector("span") || li).textContent.trim();
      if (!label) return;
      if (link && link.getAttribute("href")) {
        const a = document2.createElement("a");
        a.textContent = label;
        a.href = link.getAttribute("href");
        cells.push([a]);
      } else {
        cells.push([label]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "breadcrumbs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel.js
  function parse2(element, { document: document2 }) {
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

  // tools/importer/parsers/adventure-details.js
  function parse3(element, { document: document2 }) {
    const elements = [...element.querySelectorAll(".cmp-contentfragment__element")];
    const cells = [];
    elements.forEach((el) => {
      const titleEl = el.querySelector(".cmp-contentfragment__element-title, dt");
      const valueEl = el.querySelector(".cmp-contentfragment__element-value, dd");
      const label = titleEl ? titleEl.textContent.trim() : "";
      let value = valueEl ? valueEl.textContent.trim() : "";
      if (/price/i.test(label)) {
        const num = parseFloat(value.replace(/[^0-9.]/g, ""));
        if (!Number.isNaN(num)) value = `$${Math.round(num).toLocaleString("en-US")}`;
      }
      if (!label && !value) return;
      cells.push([label, value]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "adventure-details", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs.js
  function parse4(element, { document: document2 }) {
    const tabsRoot = element.querySelector(".cmp-tabs") || element;
    const labels = [...tabsRoot.querySelectorAll(":scope > .cmp-tabs__tablist > .cmp-tabs__tab, .cmp-tabs__tablist > li")];
    const panels = [...tabsRoot.querySelectorAll(":scope > .cmp-tabs__tabpanel, .cmp-tabs__tabpanel")];
    const cells = [];
    labels.forEach((labelEl, i) => {
      const label = labelEl.textContent.trim();
      const panel = panels[i];
      const content = panel ? panel.querySelector(".cmp-contentfragment__elements") || panel : null;
      if (!label && !content) return;
      cells.push([label, content || ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs", cells });
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

  // tools/importer/import-adventure-detail.js
  var parsers = {
    breadcrumbs: parse,
    carousel: parse2,
    "adventure-details": parse3,
    tabs: parse4
  };
  var PAGE_TEMPLATE = {
    name: "adventure-detail",
    description: "Adventure detail: breadcrumbs, hero carousel, adventure-details spec grid, tabbed content",
    urls: [
      "https://wknd.site/us/en/adventures/bali-surf-camp.html"
    ],
    blocks: [
      { name: "breadcrumbs", instances: ["main div.breadcrumb .cmp-breadcrumb"] },
      { name: "carousel", instances: ["main div.carousel.cmp-carousel--mini"] },
      { name: "adventure-details", instances: ["main div.contentfragment.cmp-contentfragment--elements"] },
      { name: "tabs", instances: ["main div.tabs.panelcontainer"] }
    ],
    sections: [
      { id: "s1-breadcrumb", name: "Breadcrumb", style: null, blocks: ["breadcrumbs"], defaultContent: [] },
      { id: "s2-carousel", name: "Hero carousel", style: null, blocks: ["carousel"], defaultContent: [] },
      // Isolate specs + tabs in their own section (style marker) so a 2-column
      // grid targets ONLY these two blocks, never the rest of the page.
      { id: "s3-body", name: "Adventure detail body", style: "two-col", selector: "main div.contentfragment.cmp-contentfragment--elements", blocks: ["adventure-details", "tabs"], defaultContent: [] }
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
  var import_adventure_detail_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      let activityValue = "";
      const cfElements = [...document2.querySelectorAll(".cmp-contentfragment__element")];
      const activityEl = cfElements.find((el) => {
        const t = el.querySelector(".cmp-contentfragment__element-title, dt");
        return t && /^activity$/i.test(t.textContent.trim());
      });
      if (activityEl) {
        const v = activityEl.querySelector(".cmp-contentfragment__element-value, dd");
        if (v) activityValue = v.textContent.trim();
      }
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
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      const metaTable = [...main.querySelectorAll("table")].find((t) => {
        const first = t.querySelector("tr td, tr th");
        return first && /^metadata$/i.test(first.textContent.trim());
      });
      if (metaTable) {
        const tbody = metaTable.querySelector("tbody") || metaTable;
        const addMetaRow = (key, value) => {
          if (!value) return;
          const tr = document2.createElement("tr");
          const k = document2.createElement("td");
          k.textContent = key;
          const v = document2.createElement("td");
          v.textContent = value;
          tr.append(k, v);
          tbody.append(tr);
        };
        addMetaRow("Template", PAGE_TEMPLATE.name);
        addMetaRow("Activity", activityValue);
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
  return __toCommonJS(import_adventure_detail_exports);
})();
