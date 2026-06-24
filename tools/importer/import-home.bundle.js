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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/carousel-hero.js
  function resolveImageUrl(img) {
    if (!img) return null;
    const candidates = [
      img.getAttribute("src"),
      img.getAttribute("data-src"),
      img.getAttribute("data-original"),
      img.getAttribute("data-originalsrc"),
      img.getAttribute("data-lazy-src")
    ];
    const srcset = img.getAttribute("data-srcset") || img.getAttribute("srcset");
    if (srcset) {
      const first = srcset.split(",")[0].trim().split(/\s+/)[0];
      if (first) candidates.push(first);
    }
    let url = candidates.find((c) => c && !c.startsWith("data:"));
    if (!url) return null;
    url = url.replace(/\.transform\/[^?#]*/i, "");
    return url;
  }
  function buildImage(slide, document) {
    const img = slide.querySelector("picture img, img");
    const url = resolveImageUrl(img);
    if (!url) return img || null;
    const newImg = document.createElement("img");
    newImg.src = url;
    const alt = img && (img.getAttribute("alt") || img.getAttribute("title")) || "";
    if (alt) newImg.alt = alt;
    return newImg;
  }
  function parse(element, { document }) {
    let slides = Array.from(element.querySelectorAll(".owl-item:not(.cloned)"));
    if (!slides.length) {
      slides = Array.from(element.querySelectorAll(".hero-carousel-item, .item"));
    }
    if (!slides.length) slides = [element];
    const cells = [];
    slides.forEach((slide) => {
      const imageCell = buildImage(slide, document);
      const contentCell = [];
      const heading = slide.querySelector('h1, h2, h3, [class*="title"]');
      if (heading) contentCell.push(heading);
      const desc = slide.querySelector('.hero-banner-desc, [class*="desc"]');
      if (desc) contentCell.push(desc);
      const ctas = Array.from(slide.querySelectorAll("a.btn, .btn-box a, a.btn-primary"));
      const seen = /* @__PURE__ */ new Set();
      ctas.forEach((a) => {
        if (!seen.has(a)) {
          seen.add(a);
          contentCell.push(a);
        }
      });
      if (imageCell || contentCell.length) {
        cells.push([imageCell || "", contentCell.length ? contentCell : ""]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-banner.js
  var BASE_URL = "https://www.kotak.bank.in";
  function resolveImageUrl2(img) {
    if (!img) return null;
    const candidates = [
      img.getAttribute("src"),
      img.getAttribute("data-src"),
      img.getAttribute("data-original"),
      img.getAttribute("data-originalsrc"),
      img.getAttribute("data-lazy-src")
    ];
    const srcset = img.getAttribute("data-srcset") || img.getAttribute("srcset");
    if (srcset) {
      const first = srcset.split(",")[0].trim().split(/\s+/)[0];
      if (first) candidates.push(first);
    }
    let url = candidates.find((c) => c && !c.startsWith("data:"));
    if (!url) return null;
    url = url.replace(/\.transform\/[^?#]*/i, "");
    return url;
  }
  function absolutize(href) {
    if (!href) return href;
    if (/^https?:\/\//i.test(href) || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
    if (href.startsWith("/")) return BASE_URL + href;
    return href;
  }
  function parse2(element, { document }) {
    let slides = Array.from(element.querySelectorAll(".owl-item:not(.cloned)"));
    if (!slides.length) {
      slides = Array.from(element.querySelectorAll(".owlcarousal-slide, .item"));
    }
    if (!slides.length) slides = [element];
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector("picture img, img");
      const url = resolveImageUrl2(img);
      let imageCell = "";
      if (url) {
        const newImg = document.createElement("img");
        newImg.src = url;
        const alt = (img.getAttribute("alt") || img.getAttribute("title") || "").trim();
        if (alt && alt.toLowerCase() !== "image is broken") newImg.alt = alt;
        const link = slide.querySelector("a[href]");
        if (link && link.getAttribute("href")) {
          const a = document.createElement("a");
          a.href = absolutize(link.getAttribute("href"));
          a.append(newImg);
          imageCell = a;
        } else {
          imageCell = newImg;
        }
      } else if (img) {
        imageCell = img;
      }
      const textCell = [];
      const heading = slide.querySelector('h1, h2, h3, [class*="title"]');
      if (heading) textCell.push(heading);
      const desc = slide.querySelector('p, [class*="desc"]');
      if (desc && desc.textContent.trim()) textCell.push(desc);
      if (imageCell || textCell.length) {
        cells.push([imageCell || "", textCell.length ? textCell : ""]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  var BASE_URL2 = "https://www.kotak.bank.in";
  var IMAGE_FALLBACK = {
    "step up with the right savings account": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/everyday-sa-feature-cad-t.jpg",
    "backing you with every swipe": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/811-super.jpeg",
    "811 super": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/811-super.jpeg",
    "hassle free home loans tailored for your needs!": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/home-loan-feature-card.jpg",
    "enjoy exclusive offers with kotak credit cards": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/cc-card-358-x-201.jpg",
    "credit cards": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/cc-card-358-x-201.jpg",
    "your goals need systematic investments": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/mutual-funds-feature-card-t.jpg",
    "mutual funds": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/mutual-funds-feature-card-t.jpg",
    "save, trade, & invest smartly": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/3-in-1-trinity-t.jpg",
    "3-in-1 trinity account": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/3-in-1-trinity-t.jpg",
    "dissolving distances. powering ambitions": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/nri-services-feature-card-t.jpg",
    "power your aspirations with personal loans": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/pl-feature-card-t.jpg",
    "personal loans": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/pl-feature-card-t.jpg",
    "power your entrepreneurial dreams": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/current-account-feature-card-t.jpg",
    "current account": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/current-account-feature-card-t.jpg",
    "not enough funds for your business dreams?": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/business-capital-feature-card-t.jpg",
    "business lending": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/business-capital-feature-card-t.jpg",
    "hausla empowered": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/bizlabs-docuseries-feature-card.jpg",
    "kotak bizlabs docuseries": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/bizlabs-docuseries-feature-card.jpg",
    "pay in a flash!": "https://www.kotak.bank.in/content/dam/Kotak/Product-Card-Images-Mobile/bhim-upi-feat-card.jpg",
    "mobile banking that keeps up with you": "https://www.kotak.bank.in/content/dam/Kotak/product_card_images/kotak-mobile-banking.jpg",
    "kotak bank app": "https://www.kotak.bank.in/content/dam/Kotak/product_card_images/kotak-mobile-banking.jpg",
    "net banking": "https://www.kotak.bank.in/content/dam/Kotak/Product-Card-Images-Mobile/NB-product-mb.jpg",
    "ways to bank": "https://www.kotak.bank.in/content/dam/Kotak/Product-Card-Images-Mobile/NB-product-mb.jpg",
    "kotak trinity account": "https://www.kotak.bank.in/content/dam/Kotak/product_card_images/ProductFeature-demat-t.jpg",
    "want to report online financial fraud?": "https://www.kotak.bank.in/content/dam/Kotak/Product-Card-Images-Mobile/20240425_Website-Banner358x201.jpg",
    "ask for your ckyc identifier today!": "https://www.kotak.bank.in/content/dam/Kotak/Product-Card-Images-Mobile/ckyc-t.jpg",
    "3-in-1 account": "https://www.kotak.bank.in/content/dam/Kotak/Product-Card-Images-Mobile/Trinity-Home-Page-Product-Banner-Final.jpg",
    "join us in the #maukaganwao campaign": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/MaukaGanwao.jpg",
    "lg": "https://www.kotak.bank.in/content/dam/Kotak/deals-offers/electronics/cc-emi/lg-offer-t.jpg",
    "tune in to channel red": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/Channel-Red.jpg"
  };
  function normalizeRendition(url) {
    if (!url) return url;
    return url.replace(/\.transform\/[^?#]*/i, "");
  }
  function resolveImageUrl3(img) {
    if (!img) return null;
    const candidates = [
      img.getAttribute("src"),
      img.getAttribute("data-src"),
      img.getAttribute("data-original"),
      img.getAttribute("data-originalsrc"),
      img.getAttribute("data-lazy-src")
    ];
    const srcset = img.getAttribute("data-srcset") || img.getAttribute("srcset");
    if (srcset) {
      const first = srcset.split(",")[0].trim().split(/\s+/)[0];
      if (first) candidates.push(first);
    }
    let url = candidates.find((c) => c && !c.startsWith("data:"));
    if (!url) return null;
    return normalizeRendition(url);
  }
  function absolutize2(href) {
    if (!href) return href;
    if (/^https?:\/\//i.test(href) || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
    if (href.startsWith("/")) return BASE_URL2 + href;
    return href;
  }
  function textOf(el) {
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function buildCard(box, column, document) {
    const eyebrowEl = box.querySelector('.info-title, .em-sub-title, [class*="sub-title"]');
    const headingEl = box.querySelector('h1, h2, h3, h4, h5, h6, .em-title, [class*="title"]:not(.info-title):not(.em-sub-title)');
    const descEl = box.querySelector('.info-box, .em-desc, [class*="desc"]');
    const ctaEl = box.querySelector("a.em-cta, .link-box a, a.em-link");
    const eyebrowText = textOf(eyebrowEl).toLowerCase();
    const headingText = textOf(headingEl).toLowerCase();
    let url = resolveImageUrl3(box.querySelector("img"));
    if (!url && column) {
      const siblingImgs = Array.from(column.querySelectorAll(".hp-main-box img"));
      for (const im of siblingImgs) {
        url = resolveImageUrl3(im);
        if (url) break;
      }
    }
    if (!url) {
      url = IMAGE_FALLBACK[headingText] || IMAGE_FALLBACK[eyebrowText] || null;
    }
    let imageCell = "";
    if (url) {
      const newImg = document.createElement("img");
      newImg.src = url;
      const srcImg = box.querySelector("img");
      const alt = srcImg && (srcImg.getAttribute("alt") || srcImg.getAttribute("title")) || textOf(headingEl) || "";
      if (alt) newImg.alt = alt;
      imageCell = newImg;
    }
    const body = [];
    if (eyebrowEl && textOf(eyebrowEl)) {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = textOf(eyebrowEl);
      p.append(strong);
      body.push(p);
    }
    if (headingEl && textOf(headingEl)) {
      const h = document.createElement("h3");
      h.textContent = textOf(headingEl);
      body.push(h);
    }
    if (descEl && textOf(descEl)) {
      const p = document.createElement("p");
      p.textContent = textOf(descEl);
      body.push(p);
    }
    if (ctaEl && textOf(ctaEl)) {
      const a = document.createElement("a");
      a.href = absolutize2(ctaEl.getAttribute("href"));
      a.textContent = textOf(ctaEl);
      body.push(a);
    }
    if (!imageCell && !body.length) return null;
    return [imageCell, body.length ? body : ""];
  }
  function parse3(element, { document }) {
    let columns = Array.from(element.querySelectorAll(':scope .row > [class*="col-"]'));
    if (!columns.length) {
      columns = Array.from(element.querySelectorAll('[class*="col-md"], [class*="col-xs"]'));
    }
    const cells = [];
    const rateColumns = [];
    columns.forEach((column) => {
      if (column.querySelector(".ratecardwrapper, .ratecard")) {
        rateColumns.push(column);
        return;
      }
      let box = column.querySelector(".hp-main-box:not(.hidden)");
      if (!box) box = column.querySelector(".hp-main-box");
      if (!box) return;
      const card = buildCard(box, column, document);
      if (card) cells.push(card);
    });
    if (!cells.length) {
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-product", cells });
    if (rateColumns.length) {
      const firstRate = rateColumns[0];
      firstRate.parentElement.insertBefore(block, firstRate);
      columns.forEach((column) => {
        if (!column.querySelector(".ratecardwrapper, .ratecard") && column.isConnected) {
          column.remove();
        }
      });
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/cards-help.js
  var BASE_URL3 = "https://www.kotak.bank.in";
  function resolveImageUrl4(img) {
    if (!img) return null;
    const candidates = [
      img.getAttribute("src"),
      img.getAttribute("data-src"),
      img.getAttribute("data-original"),
      img.getAttribute("data-originalsrc"),
      img.getAttribute("data-lazy-src")
    ];
    const srcset = img.getAttribute("data-srcset") || img.getAttribute("srcset");
    if (srcset) {
      const first = srcset.split(",")[0].trim().split(/\s+/)[0];
      if (first) candidates.push(first);
    }
    let url = candidates.find((c) => c && !c.startsWith("data:"));
    if (!url) return null;
    return url.replace(/\.transform\/[^?#]*/i, "");
  }
  function absolutize3(href) {
    if (!href) return href;
    if (/^https?:\/\//i.test(href) || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
    if (href.startsWith("/")) return BASE_URL3 + href;
    return href;
  }
  function textOf2(el) {
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function parse4(element, { document }) {
    let tiles = Array.from(element.querySelectorAll(".owl-item:not(.cloned)"));
    if (!tiles.length) {
      tiles = Array.from(element.querySelectorAll(".iconsider-large, a.iconsider-large-a"));
    }
    const cells = [];
    const seenTitles = /* @__PURE__ */ new Set();
    tiles.forEach((tile) => {
      const img = tile.querySelector("img");
      const url = resolveImageUrl4(img);
      const titleEl = tile.querySelector('.iconsider-title, h1, h2, h3, h4, h5, h6, [class*="title"]');
      const descEl = tile.querySelector('.iconsider-dec, p, [class*="dec"], [class*="desc"]');
      const linkEl = tile.querySelector("a[href]");
      const titleText = textOf2(titleEl);
      if (!titleText && !url) return;
      if (titleText && seenTitles.has(titleText)) return;
      if (titleText) seenTitles.add(titleText);
      let iconCell = "";
      if (url) {
        const newImg = document.createElement("img");
        newImg.src = url;
        const alt = (img.getAttribute("alt") || img.getAttribute("title") || titleText || "").trim();
        if (alt) newImg.alt = alt;
        iconCell = newImg;
      }
      const body = [];
      if (titleText) {
        const href = linkEl && linkEl.getAttribute("href");
        const heading = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.href = absolutize3(href);
          a.textContent = titleText;
          heading.append(a);
        } else {
          heading.textContent = titleText;
        }
        body.push(heading);
      }
      if (descEl && textOf2(descEl)) {
        const p = document.createElement("p");
        p.textContent = textOf2(descEl);
        body.push(p);
      }
      cells.push([iconCell, body.length ? body : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-help", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  var BASE_URL4 = "https://www.kotak.bank.in";
  function resolveImageUrl5(img) {
    if (!img) return null;
    const candidates = [
      img.getAttribute("src"),
      img.getAttribute("data-src"),
      img.getAttribute("data-original"),
      img.getAttribute("data-originalsrc"),
      img.getAttribute("data-lazy-src")
    ];
    const srcset = img.getAttribute("data-srcset") || img.getAttribute("srcset");
    if (srcset) {
      const first = srcset.split(",")[0].trim().split(/\s+/)[0];
      if (first) candidates.push(first);
    }
    let url = candidates.find((c) => c && !c.startsWith("data:"));
    if (!url) return null;
    return url.replace(/\.transform\/[^?#]*/i, "");
  }
  function absolutize4(href) {
    if (!href) return href;
    if (/^https?:\/\//i.test(href) || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
    if (href.startsWith("/")) return BASE_URL4 + href;
    return href;
  }
  function textOf3(el) {
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function enclosingLink(el, column) {
    let node = el.parentElement;
    while (node && node !== column) {
      if (node.tagName === "A" && node.getAttribute("href")) return node;
      node = node.parentElement;
    }
    return null;
  }
  function extractColumn(column, document) {
    const content = [];
    const usedTexts = /* @__PURE__ */ new Set();
    const usedImgUrls = /* @__PURE__ */ new Set();
    column.querySelectorAll("img").forEach((img) => {
      if (img.closest(".mf-list-item, .mf-list, li") || img.classList.contains("mf-list-icon")) return;
      const url = resolveImageUrl5(img);
      if (!url || usedImgUrls.has(url)) return;
      usedImgUrls.add(url);
      const newImg = document.createElement("img");
      newImg.src = url;
      const alt = (img.getAttribute("alt") || img.getAttribute("title") || "").trim();
      if (alt) newImg.alt = alt;
      const link = enclosingLink(img, column);
      if (link) {
        const a = document.createElement("a");
        a.href = absolutize4(link.getAttribute("href"));
        a.append(newImg);
        content.push(a);
      } else {
        content.push(newImg);
      }
    });
    column.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
      const t = textOf3(h);
      if (!t || usedTexts.has(t)) return;
      usedTexts.add(t);
      const heading = document.createElement(h.tagName.toLowerCase());
      heading.textContent = t;
      content.push(heading);
    });
    column.querySelectorAll("p").forEach((p) => {
      const t = textOf3(p);
      if (!t || usedTexts.has(t)) return;
      if (p.querySelector("a") && p.textContent.replace(/\s+/g, "") === (p.querySelector("a").textContent || "").replace(/\s+/g, "")) return;
      usedTexts.add(t);
      const para = document.createElement("p");
      para.textContent = t;
      content.push(para);
    });
    column.querySelectorAll("a[href]").forEach((a) => {
      const t = textOf3(a);
      if (!t) return;
      if (a.querySelector("h1, h2, h3, h4, h5, h6") || a.querySelector("p + p")) return;
      if (usedTexts.has(t)) return;
      const key = `${t}|${a.getAttribute("href")}`;
      if (usedTexts.has(key)) return;
      usedTexts.add(key);
      const link = document.createElement("a");
      link.href = absolutize4(a.getAttribute("href"));
      link.textContent = t;
      content.push(link);
    });
    return content;
  }
  function parse5(element, { document }) {
    const row = element.querySelector('.row, [class*="row"]') || element;
    let columns = Array.from(row.querySelectorAll(':scope > [class*="col-"]'));
    if (!columns.length) {
      columns = Array.from(element.querySelectorAll('[class*="col-md"], [class*="col-sm"]'));
    }
    if (!columns.length) columns = [element];
    const rowCells = [];
    columns.forEach((column) => {
      const content = extractColumn(column, document);
      rowCells.push(content.length ? content : "");
    });
    if (!rowCells.some((c) => c && c !== "")) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [rowCells];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-rates.js
  var BASE_URL5 = "https://www.kotak.bank.in";
  function absolutize5(href) {
    if (!href) return href;
    if (/^https?:\/\//i.test(href) || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
    if (href.startsWith("/")) return BASE_URL5 + href;
    return href;
  }
  function textOf4(el) {
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function tabLabel(card) {
    const header = card.querySelector('h2, .target, [class*="title"]');
    if (!header) return "";
    const anchor = header.querySelector("a") || header;
    const direct = Array.from(anchor.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent.replace(/\s+/g, " ").trim()).join(" ").trim();
    return direct || textOf4(anchor);
  }
  function tabContent(card, document) {
    const out = [];
    const panel = card.querySelector('.toggle-ctnt, [class*="toggle"]') || card;
    panel.querySelectorAll("p").forEach((p) => {
      const t = textOf4(p);
      if (!t) return;
      const rateEl = p.querySelector('.FR, [class*="FR"], span');
      const linkEl = p.querySelector("a[href]");
      if (rateEl && linkEl) {
        const para = document.createElement("p");
        const rate = document.createElement("strong");
        rate.textContent = textOf4(rateEl);
        para.append(rate);
        para.append(document.createTextNode(" "));
        const a = document.createElement("a");
        a.href = absolutize5(linkEl.getAttribute("href"));
        a.textContent = textOf4(linkEl);
        para.append(a);
        out.push(para);
      } else if (p.querySelector("strong") && t) {
        const para = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = t;
        para.append(strong);
        out.push(para);
      } else if (linkEl) {
        const a = document.createElement("a");
        a.href = absolutize5(linkEl.getAttribute("href"));
        a.textContent = t;
        out.push(a);
      } else {
        const para = document.createElement("p");
        para.textContent = t;
        out.push(para);
      }
    });
    return out;
  }
  function parse6(element, { document }) {
    const cards = Array.from(element.querySelectorAll(".ratecard.section, .ratecard"));
    const cells = [];
    cards.forEach((card) => {
      const label = tabLabel(card);
      const content = tabContent(card, document);
      if (!label && !content.length) return;
      cells.push([label || "", content.length ? content : ""]);
    });
    const seeAll = element.querySelector(".main-white-box > .link-box a[href], .link-box a[href]");
    if (seeAll && cells.length) {
      const a = document.createElement("a");
      a.href = absolutize5(seeAll.getAttribute("href"));
      a.textContent = textOf4(seeAll);
      const lastContent = cells[cells.length - 1][1];
      if (Array.isArray(lastContent)) {
        lastContent.push(a);
      } else {
        cells[cells.length - 1][1] = [a];
      }
    }
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-rates", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/kotak-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function isPlaceholderSrc(src) {
    if (!src) return true;
    const s = src.trim();
    if (s === "") return true;
    if (s.startsWith("data:")) return true;
    if (/(blank|placeholder|spacer|1x1|transparent)\.(gif|png|svg)(\?|$)/i.test(s)) return true;
    return false;
  }
  function firstFromSrcset(srcset) {
    if (!srcset) return "";
    const first = srcset.split(",")[0];
    if (!first) return "";
    return first.trim().split(/\s+/)[0] || "";
  }
  function normalizeRenditionUrl(url) {
    if (!url) return url;
    const m = url.match(/^(.*\.(?:jpe?g|png|webp|gif|svg))\.transform\/[^?#]*$/i);
    return m ? m[1] : url;
  }
  function promoteLazyImages(element) {
    element.querySelectorAll("img").forEach((img) => {
      const currentSrc = img.getAttribute("src");
      let resolved = "";
      if (!isPlaceholderSrc(currentSrc)) {
        resolved = currentSrc;
      } else {
        resolved = img.getAttribute("data-originalsrc") || img.getAttribute("data-src") || firstFromSrcset(img.getAttribute("data-srcset")) || firstFromSrcset(img.getAttribute("srcset")) || "";
      }
      resolved = normalizeRenditionUrl((resolved || "").trim());
      if (resolved) {
        img.setAttribute("src", resolved);
        img.removeAttribute("data-originalsrc");
        img.removeAttribute("data-src");
        img.removeAttribute("data-srcset");
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
      } else if (isPlaceholderSrc(currentSrc)) {
        img.remove();
      }
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      promoteLazyImages(element);
      WebImporter.DOMUtils.remove(element, [
        ".search-modal-popup",
        ".success-modal",
        ".get-help-popup",
        "audio",
        "#my_audio_hero"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#notification_widget",
        '[id^="modal-widget-"]',
        "#unica-icon",
        ".notificationWidgetId",
        ".unica-personlization-widget-cta"
      ]);
      WebImporter.DOMUtils.remove(element, ['[id*="DmpSlotId"]']);
      element.querySelectorAll(".owl-item.cloned").forEach((el) => el.remove());
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        ".header-container",
        ".mobile-header-container",
        ".headerfooter-container",
        "nav",
        "footer",
        ".footer",
        "#notification_widget",
        '[id^="modal-widget-"]',
        ".notificationWidgetId",
        ".success-modal",
        ".get-help-popup",
        ".modal.fade",
        "#fade",
        '[id*="DmpSlotId"]',
        "link",
        "style",
        "script",
        "noscript",
        "iframe",
        'input[type="hidden"]'
      ]);
      element.querySelectorAll(
        "ul.header-menu-ul, ul.mb-menu-ul, .header-menu, .mb-menu, .sec-footer-list-box"
      ).forEach((el) => el.remove());
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-sly-test");
        el.removeAttribute("data-sly-list");
        el.removeAttribute("data-sly-use");
        el.removeAttribute("data-mb-lilevel");
        el.removeAttribute("data-ic-target");
        el.removeAttribute("data-hem-burager");
        el.removeAttribute("onclick");
      });
    }
  }

  // tools/importer/transformers/kotak-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const sections = payload && payload.template && Array.isArray(payload.template.sections) ? payload.template.sections : [];
      if (sections.length < 2) return;
      const doc = element.ownerDocument;
      const VARIANT_CLASSES = [
        "carousel-hero",
        "carousel-banner",
        "cards-product",
        "cards-help",
        "columns-media",
        "tabs-rates"
      ];
      const blockTables = Array.from(
        element.querySelectorAll(VARIANT_CLASSES.map((c) => `.${c}`).join(","))
      );
      if (blockTables.length < 2) return;
      for (let i = blockTables.length - 1; i >= 1; i -= 1) {
        const target = blockTables[i];
        const prev = target.previousElementSibling;
        if (prev && prev.tagName === "HR") continue;
        const hr = doc.createElement("hr");
        target.parentNode.insertBefore(hr, target);
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "carousel-hero": parse,
    "carousel-banner": parse2,
    "cards-product": parse3,
    "cards-help": parse4,
    "columns-media": parse5,
    "tabs-rates": parse6
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Kotak Mahindra Bank home page",
    urls: ["https://www.kotak.bank.in/en/home.html"],
    blocks: [
      { name: "carousel-hero", instances: [".heroslider.section"] },
      {
        name: "cards-product",
        instances: [
          ".white-background > div:nth-child(1)",
          ".white-background > div:nth-child(2)",
          ".white-background > div:nth-child(8)",
          ".white-background > div:nth-child(9)"
        ]
      },
      { name: "carousel-banner", instances: [".white-background > div.thincarousalbanner.section"] },
      {
        name: "columns-media",
        instances: [".white-background > div:nth-child(4)", ".white-background > div:nth-child(6)"]
      },
      { name: "cards-help", instances: [".white-background > div:nth-child(7)"] },
      { name: "tabs-rates", instances: [".white-background > div:nth-child(9) .ratecardwrapper.section"] }
    ],
    sections: [
      { id: "section-1", name: "Hero carousel", selector: ".heroslider.section", style: null, blocks: ["carousel-hero"], defaultContent: [] },
      { id: "section-2", name: "Product card grid (row 1)", selector: ".white-background > div:nth-child(1)", style: null, blocks: ["cards-product"], defaultContent: [] },
      { id: "section-3", name: "Product card grid (row 2)", selector: ".white-background > div:nth-child(2)", style: null, blocks: ["cards-product"], defaultContent: [] },
      { id: "section-4", name: "Helpline banner carousel", selector: ".white-background > div.thincarousalbanner.section", style: null, blocks: ["carousel-banner"], defaultContent: [] },
      { id: "section-5", name: "Video + Hausla text", selector: ".white-background > div:nth-child(4)", style: null, blocks: ["columns-media"], defaultContent: [] },
      { id: "section-6", name: "Knowledge Hub heading", selector: ".white-background > div:nth-child(5)", style: null, blocks: [], defaultContent: [".white-background > div:nth-child(5)"] },
      { id: "section-7", name: "Knowledge Hub content", selector: ".white-background > div:nth-child(6)", style: null, blocks: ["columns-media"], defaultContent: [] },
      { id: "section-8", name: "Need Help", selector: ".white-background > div:nth-child(7)", style: null, blocks: ["cards-help"], defaultContent: [] },
      { id: "section-9", name: "App/promo cards (row 1)", selector: ".white-background > div:nth-child(8)", style: null, blocks: ["cards-product"], defaultContent: [] },
      { id: "section-10", name: "App/promo cards (row 2) + Rates & Charges", selector: ".white-background > div:nth-child(9)", style: null, blocks: ["cards-product", "tabs-rates"], defaultContent: [] }
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
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
