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

  // tools/importer/import-magazine-article.js
  var import_magazine_article_exports = {};
  __export(import_magazine_article_exports, {
    default: () => import_magazine_article_default
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

  // tools/importer/parsers/article-body.js
  function parse2(element, { document: document2 }) {
    const aside = element.nextElementSibling;
    const left = [];
    const h1 = element.querySelector("h1");
    if (h1) {
      const h = document2.createElement("h1");
      h.textContent = h1.textContent.trim();
      left.push(h);
    }
    const byline = element.querySelector("h4");
    if (byline) {
      const h = document2.createElement("h4");
      h.textContent = byline.textContent.trim();
      left.push(h);
    }
    const cf = element.querySelector("article.contentfragment, .cmp-contentfragment__elements");
    if (cf) {
      const nodes = cf.querySelectorAll("h2, h3, blockquote, p, img");
      nodes.forEach((node) => {
        if (node.matches(".cmp-contentfragment__title")) return;
        if (node.tagName === "IMG") {
          left.push(node.cloneNode(true));
          return;
        }
        if (node.tagName === "P" && !node.textContent.trim() && !node.querySelector("img")) {
          return;
        }
        const clone = document2.createElement(node.tagName.toLowerCase());
        clone.innerHTML = node.innerHTML;
        if (clone.textContent.trim() || clone.querySelector("img")) left.push(clone);
      });
    }
    const authorXf = element.querySelector(".experiencefragment, .cmp-experiencefragment");
    if (authorXf) {
      const name = authorXf.querySelector("h2, h3");
      const role = authorXf.querySelector("p");
      const avatar = authorXf.querySelector("img");
      if (name && name.textContent.trim()) {
        left.push(document2.createElement("hr"));
        if (avatar) left.push(avatar.cloneNode(true));
        const h = document2.createElement("h2");
        h.textContent = name.textContent.trim();
        left.push(h);
        if (role && role.textContent.trim()) {
          const p = document2.createElement("p");
          p.textContent = role.textContent.trim();
          left.push(p);
        }
      }
    }
    const right = [];
    if (aside) {
      const shareHeading = aside.querySelector(".title h5, h5");
      if (shareHeading && shareHeading.textContent.trim()) {
        const h = document2.createElement("h5");
        h.textContent = shareHeading.textContent.trim();
        right.push(h);
      }
      const items = aside.querySelectorAll(".cmp-list__item, li");
      if (items.length) {
        const ul = document2.createElement("ul");
        items.forEach((li) => {
          const link = li.querySelector("a[href]");
          if (!link) return;
          const title = (li.querySelector(".cmp-list__item-title") || link).textContent.trim();
          const date = (li.querySelector(".cmp-list__item-date") || {}).textContent || "";
          if (!title) return;
          const outLi = document2.createElement("li");
          const a = document2.createElement("a");
          a.setAttribute("href", link.getAttribute("href"));
          a.textContent = title;
          outLi.append(a);
          if (date.trim()) {
            outLi.append(document2.createElement("br"));
            const dateSpan = document2.createElement("em");
            dateSpan.textContent = date.trim();
            outLi.append(dateSpan);
          }
          ul.append(outLi);
        });
        if (ul.children.length) right.push(ul);
      }
    }
    if (!left.length && !right.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[left, right]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns (article)", cells });
    element.replaceWith(block);
    if (aside && aside.parentNode) aside.remove();
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

  // tools/importer/import-magazine-article.js
  var parsers = {
    breadcrumbs: parse,
    "article-body": parse2
  };
  var PAGE_TEMPLATE = {
    name: "magazine-article",
    description: "Magazine article: hero image, breadcrumbs, two-column body (article + share/related sidebar)",
    urls: [
      "https://wknd.site/us/en/magazine/arctic-surfing.html"
    ],
    blocks: [
      { name: "breadcrumbs", instances: ["main div.breadcrumb .cmp-breadcrumb"] },
      // The two-column body: LEFT = body main (title/byline/article/author bio),
      // RIGHT = the sidebar aside (merged in by the parser).
      { name: "article-body", instances: ["main main.container:has(article.contentfragment)"] }
    ],
    sections: [
      // s1 hero image: first section, full content-width. No leading break.
      { id: "s1-hero", name: "Hero image", style: null, selector: "main div.image", blocks: [], defaultContent: ["image"] },
      { id: "s2-breadcrumb", name: "Breadcrumb", style: null, selector: "main div.breadcrumb", blocks: ["breadcrumbs"], defaultContent: [] },
      { id: "s3-body", name: "Article body", style: null, selector: "main main.container:has(article.contentfragment)", blocks: ["article-body"], defaultContent: [] }
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
  var import_magazine_article_default = {
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
  return __toCommonJS(import_magazine_article_exports);
})();
