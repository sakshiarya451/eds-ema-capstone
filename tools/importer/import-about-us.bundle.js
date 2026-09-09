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

  // tools/importer/import-about-us.js
  var import_about_us_exports = {};
  __export(import_about_us_exports, {
    default: () => import_about_us_default
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

  // tools/importer/import-about-us.js
  var PAGE_TEMPLATE = {
    name: "content-overview",
    description: "About Us: title, two contributor groups (Our Contributors, WKND Guides) as person cards",
    urls: ["https://wknd.site/us/en/about-us.html"],
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
  function extractPeople(document) {
    const names = [...document.querySelectorAll("main h3, .cmp-title__text")].filter((h) => h.tagName === "H3");
    const people = [];
    names.forEach((h3) => {
      let card = h3;
      for (let i = 0; i < 6 && card.parentElement; i += 1) {
        card = card.parentElement;
        if (card.querySelector("img") && card.querySelector("h3") && card.querySelector("h5")) break;
      }
      const img = card.querySelector("img");
      const h5 = card.querySelector("h5");
      const socials = [...card.querySelectorAll("a[href]")].map((a) => ({
        label: (a.getAttribute("aria-label") || a.textContent || "").trim(),
        href: a.getAttribute("href") || "#"
      }));
      people.push({
        name: h3.textContent.trim(),
        role: h5 ? h5.textContent.trim() : "",
        img,
        socials
      });
    });
    return people;
  }
  function buildContributorBlock(document, people) {
    const rows = people.map((p) => {
      const imgCell = p.img ? p.img.cloneNode(true) : "";
      const body = [];
      const h3 = document.createElement("h3");
      h3.textContent = p.name;
      body.push(h3);
      if (p.role) {
        const h5 = document.createElement("h5");
        h5.textContent = p.role;
        body.push(h5);
      }
      p.socials.forEach((s) => {
        const a = document.createElement("a");
        a.setAttribute("href", s.href);
        a.textContent = s.label || "Social";
        const wrap = document.createElement("p");
        wrap.append(a);
        body.push(wrap);
      });
      return [imgCell, body];
    });
    return WebImporter.Blocks.createBlock(document, {
      name: "cards (contributors)",
      cells: rows
    });
  }
  var import_about_us_default = {
    transform: (payload) => {
      const {
        document,
        url,
        params
      } = payload;
      const main = document.body;
      const people = extractPeople(document);
      const contributors = people.slice(0, 4);
      const guides = people.slice(4);
      const h2s = [...document.querySelectorAll("main h2")];
      const introFor = (label) => {
        const h2 = h2s.find((h) => new RegExp(label, "i").test(h.textContent));
        if (!h2) return "";
        let node = h2.closest('.title, [class*="title"]') || h2;
        const scope = h2.closest(".cmp-container") || document.querySelector("main");
        const texts = [...scope.querySelectorAll(".cmp-text, p")].map((t) => t.textContent.trim()).filter(Boolean);
        if (/contributors/i.test(label)) {
          return texts.find((t) => /outstanding individuals|compelling stories/i.test(t)) || "";
        }
        return texts.find((t) => /extraordinary travel guides|certified WKND guide/i.test(t)) || "";
      };
      const contributorsIntro = introFor("Our Contributors");
      const guidesIntro = introFor("WKND Guides");
      executeTransformers("beforeTransform", main, payload);
      main.textContent = "";
      const addH = (level, text) => {
        const h = document.createElement(`h${level}`);
        h.textContent = text;
        main.appendChild(h);
      };
      const addHr = () => main.appendChild(document.createElement("hr"));
      const addP = (text) => {
        if (!text) return;
        const p = document.createElement("p");
        p.textContent = text;
        main.appendChild(p);
      };
      addH(1, "About Us");
      addHr();
      addH(2, "Our Contributors");
      addP(contributorsIntro);
      if (contributors.length) main.appendChild(buildContributorBlock(document, contributors));
      addHr();
      addH(2, "WKND Guides");
      addP(guidesIntro);
      if (guides.length) main.appendChild(buildContributorBlock(document, guides));
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
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: ["cards (contributors)"] }
      }];
    }
  };
  return __toCommonJS(import_about_us_exports);
})();
