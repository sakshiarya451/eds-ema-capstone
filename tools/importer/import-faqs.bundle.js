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

  // tools/importer/import-faqs.js
  var import_faqs_exports = {};
  __export(import_faqs_exports, {
    default: () => import_faqs_default
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

  // tools/importer/import-faqs.js
  var PAGE_TEMPLATE = {
    name: "faq-page",
    description: "FAQ page: two-column body \u2014 intro + accordion (7 Q&A) left, help sidebar right",
    urls: ["https://wknd.site/us/en/faqs.html"],
    blocks: []
  };
  var transformers = [transform];
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
  function extractFaqs(document) {
    const items = [...document.querySelectorAll(".cmp-accordion__item")];
    return items.map((it) => {
      var _a;
      const q = ((_a = (it.querySelector(".cmp-accordion__title, .cmp-accordion__button") || {}).textContent) == null ? void 0 : _a.trim()) || "";
      const panel = it.querySelector(".cmp-accordion__panel");
      const aEl = panel ? panel.querySelector("p") || panel : null;
      const a = aEl ? aEl.textContent.trim() : "";
      return { q, a };
    }).filter((x) => x.q);
  }
  var import_faqs_default = {
    transform: (payload) => {
      var _a;
      const {
        document,
        url,
        params
      } = payload;
      const main = document.body;
      const h1Text = ((_a = (document.querySelector("main h1") || {}).textContent) == null ? void 0 : _a.trim()) || "FAQs";
      const introImg = document.querySelector("main img");
      const introP = [...document.querySelectorAll("main p")].find((p) => /collective of outdoors/i.test(p.textContent));
      const introText = introP ? introP.textContent.trim() : "";
      const faqs = extractFaqs(document);
      const helpHeading = [...document.querySelectorAll("main h3")].find((h) => /need more help/i.test(h.textContent));
      const helpTitle = helpHeading ? helpHeading.textContent.trim() : "Need more help?";
      const contactP = [...document.querySelectorAll("main p")].find((p) => /give us a call/i.test(p.textContent));
      const contactClone = contactP ? contactP.cloneNode(true) : null;
      executeTransformers("beforeTransform", main, payload);
      main.textContent = "";
      const left = [];
      const h1 = document.createElement("h1");
      h1.textContent = h1Text;
      left.push(h1);
      if (introImg) left.push(introImg.cloneNode(true));
      if (introText) {
        const p = document.createElement("p");
        p.textContent = introText;
        left.push(p);
      }
      const accordionRows = faqs.map((f) => {
        const qCell = document.createElement("div");
        qCell.textContent = f.q;
        const aCell = document.createElement("div");
        const ap = document.createElement("p");
        ap.textContent = f.a;
        aCell.append(ap);
        return [qCell, aCell];
      });
      const accordionBlock = WebImporter.Blocks.createBlock(document, {
        name: "accordion",
        cells: accordionRows
      });
      left.push(accordionBlock);
      const right = [];
      right.push(document.createElement("hr"));
      const h3 = document.createElement("h3");
      h3.textContent = helpTitle;
      right.push(h3);
      if (contactClone) right.push(contactClone);
      const columnsBlock = WebImporter.Blocks.createBlock(document, {
        name: "columns (faq)",
        cells: [[left, right]]
      });
      main.appendChild(columnsBlock);
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
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: ["columns (faq)", "accordion"] }
      }];
    }
  };
  return __toCommonJS(import_faqs_exports);
})();
