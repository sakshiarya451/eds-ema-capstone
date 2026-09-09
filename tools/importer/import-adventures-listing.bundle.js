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

  // tools/importer/import-adventures-listing.js
  var import_adventures_listing_exports = {};
  __export(import_adventures_listing_exports, {
    default: () => import_adventures_listing_default
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

  // tools/importer/import-adventures-listing.js
  var PAGE_TEMPLATE = {
    name: "adventures-listing",
    description: "Adventures listing: title, intro columns, dynamic filterable adventure cards",
    urls: [
      "https://wknd.site/us/en/adventures.html"
    ],
    blocks: []
  };
  var transformers = [
    transform
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
  var import_adventures_listing_default = {
    transform: (payload) => {
      const {
        document,
        url,
        params
      } = payload;
      const main = document.body;
      const fixedMains = [...document.querySelectorAll("main.cmp-layout-container--fixed, main.container.responsivegrid")];
      const currentAdvMain = fixedMains.reverse().find((m) => /current adventures/i.test(m.textContent));
      if (currentAdvMain) currentAdvMain.remove();
      const heroTeaser = document.querySelector("main div.teaser.cmp-teaser--hero");
      if (heroTeaser) {
        const img = heroTeaser.querySelector(".cmp-teaser__image img, .cmp-image img, img");
        const h2 = heroTeaser.querySelector(".cmp-teaser__title, h2, h3");
        const desc = heroTeaser.querySelector('.cmp-teaser__description, [class*="description"], p');
        const textCell = [];
        if (h2) {
          const h = document.createElement("h2");
          h.textContent = h2.textContent.trim();
          textCell.push(h);
        }
        if (desc) {
          const p = document.createElement("p");
          p.textContent = desc.textContent.trim();
          textCell.push(p);
        }
        const introBlock = WebImporter.Blocks.createBlock(document, {
          name: "columns (intro)",
          cells: [[img ? img.cloneNode(true) : ""], [textCell]]
        });
        heroTeaser.replaceWith(document.createElement("hr"), introBlock);
      }
      executeTransformers("beforeTransform", main, payload);
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      const heading = document.createElement("h2");
      heading.textContent = "Current Adventures";
      main.appendChild(heading);
      const cardsBlock = WebImporter.Blocks.createBlock(document, {
        name: "cards (adventures)",
        cells: [[""]]
      });
      main.appendChild(cardsBlock);
      const hr = document.createElement("hr");
      main.appendChild(hr);
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
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: ["columns (intro)", "cards (adventures)"] }
      }];
    }
  };
  return __toCommonJS(import_adventures_listing_exports);
})();
