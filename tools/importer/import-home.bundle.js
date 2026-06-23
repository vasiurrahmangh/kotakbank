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
  function parse(element, { document }) {
    let slideEls = Array.from(element.querySelectorAll(":scope .owl-item"));
    if (!slideEls.length) {
      slideEls = Array.from(element.querySelectorAll('.hero-carousel-item, .hero-slider, [class*="hero-banner"]'));
    }
    const cells = [];
    const seenTitles = /* @__PURE__ */ new Set();
    slideEls.forEach((slideEl) => {
      if (slideEl.classList && slideEl.classList.contains("cloned")) return;
      slideEl.querySelectorAll(".modal, audio, .owl-nav, .owl-dots").forEach((n) => n.remove());
      const picture = slideEl.querySelector("picture");
      const img = slideEl.querySelector("img.hs-image, picture img, img");
      const title = slideEl.querySelector("h1.hero-banner-title, h2.hero-banner-title, .hero-banner-title, h1, h2, h3");
      const desc = slideEl.querySelector(".hero-banner-desc");
      const ctas = Array.from(slideEl.querySelectorAll("a.btn, .btn-box a, a.btn-primary"));
      if (!picture && !img && !title && !desc && !ctas.length) return;
      const key = title && title.textContent.trim() || img && img.getAttribute("src") || "";
      if (key && seenTitles.has(key)) return;
      if (key) seenTitles.add(key);
      const imageCell = picture || img || "";
      const contentCell = [];
      if (title) contentCell.push(title);
      if (desc) contentCell.push(desc);
      ctas.forEach((cta) => contentCell.push(cta));
      cells.push([imageCell, contentCell.length ? contentCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-banner.js
  function parse2(element, { document }) {
    let slideEls = Array.from(element.querySelectorAll(":scope .owl-item"));
    if (!slideEls.length) {
      slideEls = Array.from(element.querySelectorAll(".owlcarousal-slide"));
    }
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    slideEls.forEach((slideEl) => {
      if (slideEl.classList && slideEl.classList.contains("cloned")) return;
      const link = slideEl.querySelector("a.cursor-pointer, a[href]");
      const picture = slideEl.querySelector("picture");
      const img = slideEl.querySelector("img.slider-img, picture img, img");
      if (!picture && !img && !link) return;
      const key = img && (img.getAttribute("src") || img.getAttribute("data-src")) || link && link.getAttribute("href") || "";
      if (key && seen.has(key)) return;
      if (key) seen.add(key);
      let imageCell = picture || img || "";
      if (link && (link.querySelector("picture") || link.querySelector("img"))) {
        imageCell = link;
      }
      cells.push([imageCell, ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  var CARD_IMAGE_FALLBACK = {
    "step up with the right savings account": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/everyday-sa-feature-cad-t.jpg",
    "backing you with every swipe": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/811-super.jpeg",
    "hassle free home loans tailored for your needs!": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/home-loan-feature-card.jpg",
    "enjoy exclusive offers with kotak credit cards": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/cc-card-358-x-201.jpg",
    "your goals need systematic investments": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/mutual-funds-feature-card-t.jpg",
    "save, trade, & invest smartly": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/3-in-1-trinity-t.jpg",
    "dissolving distances. powering ambitions": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/nri-services-feature-card-t.jpg",
    "power your aspirations with personal loans": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/pl-feature-card-t.jpg",
    "power your entrepreneurial dreams": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/current-account-feature-card-t.jpg",
    "not enough funds for your business dreams?": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/business-capital-feature-card-t.jpg",
    "hausla empowered": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/bizlabs-docuseries-feature-card.jpg",
    "pay in a flash!": "https://www.kotak.bank.in/content/dam/Kotak/Product-Card-Images-Mobile/bhim-upi-feat-card.jpg",
    "mobile banking that keeps up with you": "https://www.kotak.bank.in/content/dam/Kotak/product_card_images/kotak-mobile-banking.jpg",
    "ask for your ckyc identifier today!": "https://www.kotak.bank.in/content/dam/Kotak/Product-Card-Images-Mobile/ckyc-t.jpg",
    "join us in the #maukaganwao campaign": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/MaukaGanwao.jpg",
    lg: "https://www.kotak.bank.in/content/dam/Kotak/deals-offers/electronics/cc-emi/lg-offer-t.jpg",
    "tune in to channel red": "https://www.kotak.bank.in/content/dam/Kotak/feature-cards/Channel-Red.jpg"
  };
  function parse3(element, { document }) {
    const cells = [];
    const resolveImageUrl = (img) => {
      if (!img) return "";
      const candidates = [
        img.getAttribute("src"),
        img.getAttribute("data-src"),
        img.getAttribute("data-original"),
        img.getAttribute("data-originalsrc"),
        img.getAttribute("data-lazy-src")
      ].filter(Boolean);
      const normalize = (u) => u ? u.replace(/\.transform\/[^?#]*/i, "") : u;
      const real = candidates.find((u) => u && !u.startsWith("data:"));
      if (real) return normalize(real);
      const srcset = img.getAttribute("srcset") || img.getAttribute("data-srcset");
      if (srcset) return normalize(srcset.split(",")[0].trim().split(/\s+/)[0]);
      return normalize(candidates.find((u) => u && !u.startsWith("data:")) || "");
    };
    const boxHasImage = (box) => {
      const img = box.querySelector("img.em-img, img.img-responsive, picture img, img");
      return !!resolveImageUrl(img);
    };
    const pickBox = (boxes) => boxes.find((b) => !b.classList.contains("hidden") && boxHasImage(b)) || boxes.find((b) => boxHasImage(b)) || boxes.find((b) => !b.classList.contains("hidden")) || boxes[0];
    const findCardImage = (card, col) => {
      const own = card.querySelector("img.em-img, img.img-responsive, picture img, img");
      if (own && resolveImageUrl(own)) return own;
      if (col) {
        const sibling = Array.from(col.querySelectorAll("img.em-img, img.img-responsive, picture img, img")).find((im) => resolveImageUrl(im));
        if (sibling) return sibling;
      }
      return own;
    };
    let cardEls = [];
    const cardCols = /* @__PURE__ */ new Map();
    const columns = Array.from(element.querySelectorAll('.col-md-4, [class*="col-4-4-4"]'));
    if (columns.length) {
      columns.forEach((col) => {
        if (col.querySelector(".ratecardwrapper, .ratecard")) return;
        const boxes = Array.from(col.querySelectorAll(".hp-main-box"));
        const chosen = pickBox(boxes);
        if (chosen) {
          cardEls.push(chosen);
          cardCols.set(chosen, col);
        }
      });
    }
    if (!cardEls.length) {
      cardEls = Array.from(element.querySelectorAll(".hp-main-box:not(.hidden)"));
    }
    if (!cardEls.length) {
      cardEls = Array.from(element.querySelectorAll('.main-white-box, [class*="card"]'));
    }
    cardEls.forEach((card) => {
      const img = findCardImage(card, cardCols.get(card));
      const eyebrow = card.querySelector(".em-sub-title, .info-title");
      const heading = card.querySelector("h4.em-title, .em-title, h2, h3, h4, h5");
      const desc = card.querySelector(".em-desc, .info-box");
      const cta = card.querySelector("a.em-cta") || card.querySelector(".link-box a[href]") || card.querySelector("a.em-link:not(.link-card)");
      if (!img && !eyebrow && !heading && !desc) return;
      let url = img ? resolveImageUrl(img) : "";
      let altText = img ? img.getAttribute("alt") || img.getAttribute("title") || "" : "";
      if (!url) {
        const headText = (heading && heading.textContent ? heading.textContent : "").trim().toLowerCase();
        const eyebrowText = (eyebrow && eyebrow.textContent ? eyebrow.textContent : "").trim().toLowerCase();
        url = CARD_IMAGE_FALLBACK[headText] || CARD_IMAGE_FALLBACK[eyebrowText] || "";
        if (url && !altText) altText = (heading && heading.textContent ? heading.textContent : eyebrow && eyebrow.textContent ? eyebrow.textContent : "").trim();
      }
      let imageCell = "";
      if (url) {
        const newImg = document.createElement("img");
        newImg.setAttribute("src", url);
        if (altText) newImg.setAttribute("alt", altText);
        const picture = document.createElement("picture");
        picture.append(newImg);
        imageCell = picture;
      }
      const body = [];
      if (eyebrow) body.push(eyebrow);
      if (heading) body.push(heading);
      if (desc) body.push(desc);
      if (cta) {
        cta.querySelectorAll("i, svg").forEach((n) => n.remove());
        body.push(cta);
      }
      cells.push([imageCell, body.length ? body : ""]);
    });
    const rateCol = element.querySelector(".ratecardwrapper, .ratecard");
    if (!cells.length) {
      if (!rateCol) element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-product", cells });
    if (rateCol) {
      const rateColumn = rateCol.closest('.col-md-4, [class*="col-4-4-4"]') || rateCol;
      const parent = rateColumn.parentNode;
      parent.insertBefore(block, rateColumn);
      Array.from(parent.children).forEach((child) => {
        if (child !== block && child !== rateColumn && !child.contains(rateColumn)) {
          child.remove();
        }
      });
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/cards-help.js
  function parse4(element, { document }) {
    const cells = [];
    const resolveImageUrl = (img) => {
      if (!img) return "";
      const candidates = [
        img.getAttribute("src"),
        img.getAttribute("data-src"),
        img.getAttribute("data-original"),
        img.getAttribute("data-lazy-src")
      ].filter(Boolean);
      const real = candidates.find((u) => u && !u.startsWith("data:"));
      if (real) return real;
      const srcset = img.getAttribute("srcset") || img.getAttribute("data-srcset");
      if (srcset) return srcset.split(",")[0].trim().split(/\s+/)[0];
      return candidates[0] || "";
    };
    let tiles = Array.from(element.querySelectorAll("a.iconsider-large-a"));
    if (!tiles.length) {
      tiles = Array.from(element.querySelectorAll('.iconsider-large, [class*="iconsider-large"]'));
    }
    const seen = /* @__PURE__ */ new Set();
    tiles.forEach((tile) => {
      if (tile.closest(".cloned")) return;
      const href = tile.matches("a[href]") ? tile.getAttribute("href") : tile.querySelector("a[href]") && tile.querySelector("a[href]").getAttribute("href");
      const iconImg = tile.querySelector(".iconsider-large-img img, img");
      const title = tile.querySelector(".iconsider-title");
      const desc = tile.querySelector(".iconsider-dec, p");
      if (!iconImg && !title && !desc) return;
      const key = href || title && title.textContent.trim() || "";
      if (key && seen.has(key)) return;
      if (key) seen.add(key);
      let imageCell = "";
      if (iconImg) {
        const url = resolveImageUrl(iconImg);
        if (url) {
          const newImg = document.createElement("img");
          newImg.setAttribute("src", url);
          const alt = title && title.textContent.trim() || iconImg.getAttribute("alt") || "";
          if (alt) newImg.setAttribute("alt", alt);
          const picture = document.createElement("picture");
          picture.append(newImg);
          imageCell = picture;
        }
      }
      const textCell = [];
      if (title) {
        const titleText = title.textContent.trim();
        if (href) {
          const link = document.createElement("a");
          link.setAttribute("href", href);
          link.textContent = titleText;
          const p = document.createElement("p");
          p.append(link);
          textCell.push(p);
        } else {
          textCell.push(title);
        }
      }
      if (desc && desc.textContent.trim()) textCell.push(desc);
      cells.push([imageCell, textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-help", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  function parse5(element, { document }) {
    const resolveImageUrl = (img) => {
      if (!img) return "";
      const candidates = [
        img.getAttribute("src"),
        img.getAttribute("data-src"),
        img.getAttribute("data-original"),
        img.getAttribute("data-lazy-src")
      ].filter(Boolean);
      const real = candidates.find((u) => u && !u.startsWith("data:"));
      if (real) return real;
      const srcset = img.getAttribute("srcset") || img.getAttribute("data-srcset");
      if (srcset) return srcset.split(",")[0].trim().split(/\s+/)[0];
      return candidates.find((u) => u && !u.startsWith("data:")) || "";
    };
    const cleanColumn = (col) => {
      col.querySelectorAll("link, style, script, input, .owl-nav, .owl-dots").forEach((n) => n.remove());
      col.querySelectorAll("img").forEach((img) => {
        const url = resolveImageUrl(img);
        if (url) {
          img.setAttribute("src", url);
        } else {
          img.remove();
        }
        img.removeAttribute("data-src");
        img.removeAttribute("data-srcset");
        img.removeAttribute("srcset");
      });
      col.querySelectorAll("a").forEach((a) => {
        if (!a.textContent.trim() && !a.querySelector("img, picture, video, iframe")) a.remove();
      });
      return col;
    };
    let columns = [];
    const row = element.querySelector(":scope .row") || element.querySelector(".row");
    if (row) {
      columns = Array.from(row.children).filter((c) => /\bcol-/.test(c.className) || c.children.length);
    }
    if (!columns.length) {
      columns = Array.from(element.querySelectorAll(":scope > div"));
    }
    const cellRow = columns.map((col) => cleanColumn(col.cloneNode(true))).filter((col) => col.textContent.trim() || col.querySelector("img, picture, video, iframe, a"));
    if (!cellRow.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [cellRow];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-rates.js
  function parse6(element, { document }) {
    let scope = element;
    let rateCards = Array.from(scope.querySelectorAll(".ratecard.section"));
    if (!rateCards.length) {
      const wrapper = element.querySelector(".ratecardwrapper") || (document.querySelector ? document.querySelector(".ratecardwrapper") : null);
      if (wrapper) {
        scope = wrapper;
        rateCards = Array.from(wrapper.querySelectorAll(".ratecard.section"));
      }
    }
    if (!rateCards.length) {
      rateCards = Array.from(scope.querySelectorAll(".rate-card, .ratecard"));
    }
    const seeAll = scope.querySelector('.link-box a[href]:not([href^="javascript"])');
    const cells = [];
    rateCards.forEach((card, idx) => {
      const labelEl = card.querySelector("h2.target, h2, .target");
      const panel = card.querySelector(".toggle-ctnt, .block");
      let labelText = "";
      if (labelEl) {
        const clone = labelEl.cloneNode(true);
        clone.querySelectorAll("figure, img, i, svg").forEach((n) => n.remove());
        labelText = clone.textContent.replace(/\s+/g, " ").trim();
      }
      const label = document.createElement("p");
      label.textContent = labelText || `Tab ${idx + 1}`;
      const contentCell = [];
      if (panel) {
        const panelClone = panel.cloneNode(true);
        panelClone.querySelectorAll("script, style, link, input, i, svg").forEach((n) => n.remove());
        contentCell.push(panelClone);
      }
      if (idx === rateCards.length - 1 && seeAll) {
        const link = document.createElement("a");
        link.setAttribute("href", seeAll.getAttribute("href"));
        link.textContent = seeAll.textContent.replace(/\s+/g, " ").trim() || "See all rates";
        const p = document.createElement("p");
        p.append(link);
        contentCell.push(p);
      }
      if (!labelText && !contentCell.length) return;
      cells.push([label, contentCell.length ? contentCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-rates", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/kotak-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#search-modal",
        "#audioPopupShow",
        ".modal.fade",
        "#fade"
      ]);
      element.querySelectorAll(".owl-item.cloned").forEach((el) => el.remove());
      element.querySelectorAll("input").forEach((el) => el.remove());
      const LAZY_SRC_ATTRS = ["data-originalsrc", "data-src", "data-original", "data-lazy-src"];
      const normalizeRendition = (u) => u ? u.replace(/\.transform\/[^?#]*/i, "") : u;
      element.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src") || "";
        const hasRealSrc = src.trim() !== "" && !src.startsWith("data:");
        if (hasRealSrc) {
          img.setAttribute("src", normalizeRendition(src));
          return;
        }
        let resolved = "";
        LAZY_SRC_ATTRS.some((attr) => {
          const v = img.getAttribute(attr);
          if (v && v.trim() !== "" && !v.trim().startsWith("data:")) {
            resolved = v.trim();
            return true;
          }
          return false;
        });
        if (!resolved) {
          const srcset = img.getAttribute("data-srcset") || img.getAttribute("srcset") || "";
          if (srcset) resolved = srcset.split(",")[0].trim().split(/\s+/)[0];
        }
        if (resolved) img.setAttribute("src", normalizeRendition(resolved));
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Notification / maintenance widget at top of body.
        '[id^="modal-widget-"]',
        "#notification_widget",
        ".notificationWidgetId",
        // Global site header / navigation.
        "header.header-container",
        ".mobile-header-container",
        // Mobile bottom tab bar ("Home / Learn / Help / Get App").
        ".headerfooter-container",
        // Global site footer.
        "footer.footer",
        // Loader overlay.
        "#fade",
        // DMP / ad slot placeholders (e.g. <div id="bp_6088_DmpSlotId134">).
        '[id^="bp_"][id*="DmpSlotId"]',
        // Non-content scaffolding / scripts / tracking.
        "link",
        "style",
        "script",
        "noscript",
        "iframe",
        "audio"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-sly-test");
        el.removeAttribute("data-sly-list");
        el.removeAttribute("data-hem-burager");
        el.removeAttribute("data-ic-target");
        el.removeAttribute("data-mb-lilevel");
        el.removeAttribute("data-size");
      });
      const LAZY_ATTRS = ["data-srcset", "data-originalsrc", "data-src", "data-original", "data-lazy-src", "srcset"];
      const hasLazyUrl = (img) => LAZY_ATTRS.some((attr) => {
        const v = img.getAttribute(attr);
        return v && v.trim() !== "" && !v.trim().startsWith("data:");
      });
      element.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src") || "";
        const isEmpty = src.trim() === "";
        const isInlineSvg = src.startsWith("data:image/svg+xml");
        if ((isEmpty || isInlineSvg) && !hasLazyUrl(img)) {
          img.remove();
        }
      });
    }
  }

  // tools/importer/transformers/kotak-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const template = payload && payload.template;
      const sections = template && Array.isArray(template.sections) ? template.sections : [];
      if (sections.length < 2) {
        return;
      }
      const doc = element.ownerDocument;
      const resolveSectionEl = (section) => {
        if (!section || !section.selector) return null;
        let el = null;
        try {
          el = doc.querySelector(section.selector);
        } catch (e) {
          el = null;
        }
        if (el) return el;
        const parts = section.selector.split(">").map((p) => p.trim()).filter(Boolean);
        const last = parts[parts.length - 1];
        if (!last) return null;
        const nthMatch = last.match(/:nth-of-type\((\d+)\)\s*$/);
        const nth = nthMatch ? parseInt(nthMatch[1], 10) : null;
        const base = last.replace(/:nth-of-type\(\d+\)\s*$/, "").trim();
        let scope = element;
        for (let p = parts.length - 1; p >= 1; p -= 1) {
          const prefix = parts.slice(0, p).join(" > ");
          try {
            const found = doc.querySelector(prefix) || element.querySelector(prefix.replace(/^body\s*>?\s*/, ""));
            if (found) {
              scope = found;
              break;
            }
          } catch (e) {
          }
        }
        let candidates = [];
        try {
          candidates = Array.from(scope.children).filter((c) => c.matches(base));
        } catch (e) {
          candidates = [];
        }
        if (candidates.length === 0) {
          try {
            candidates = Array.from(scope.querySelectorAll(base));
          } catch (e) {
            candidates = [];
          }
        }
        if (candidates.length === 0) return null;
        const idx = nth ? nth - 1 : 0;
        return candidates[idx] || null;
      };
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const sectionEl = resolveSectionEl(section);
        if (!sectionEl) {
          continue;
        }
        if (section.style) {
          const meta = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.parentNode.insertBefore(meta, sectionEl.nextSibling);
        }
        if (i > 0) {
          const hr = doc.createElement("hr");
          sectionEl.parentNode.insertBefore(hr, sectionEl);
        }
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
    description: "Kotak Mahindra Bank home page: hero carousel, product card grid, helpline banner carousel, video/Hausla section, Knowledge Hub, Need Help cards, app/promo cards, Rates & Charges, footer link lists",
    urls: [
      "https://www.kotak.bank.in/en/home.html"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: [".heroslider.section"]
      },
      {
        name: "cards-product",
        instances: [
          ".white-background > div:nth-child(1)",
          ".white-background > div:nth-child(2)",
          ".white-background > div:nth-child(8)",
          ".white-background > div:nth-child(9)"
        ]
      },
      {
        name: "carousel-banner",
        instances: [".white-background > div.thincarousalbanner.section"]
      },
      {
        name: "columns-media",
        instances: [
          ".white-background > div:nth-child(4)",
          ".white-background > div:nth-child(6)"
        ]
      },
      {
        name: "cards-help",
        instances: [".white-background > div:nth-child(7)"]
      },
      {
        name: "tabs-rates",
        instances: [".white-background > div:nth-child(9) .ratecardwrapper.section"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero carousel",
        selector: ".heroslider.section",
        style: null,
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Product card grid (row 1)",
        selector: ".white-background > div:nth-child(1)",
        style: null,
        blocks: ["cards-product"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Product card grid (row 2)",
        selector: ".white-background > div:nth-child(2)",
        style: null,
        blocks: ["cards-product"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Helpline banner carousel",
        selector: ".white-background > div.thincarousalbanner.section",
        style: null,
        blocks: ["carousel-banner"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Video + Hausla text",
        selector: ".white-background > div:nth-child(4)",
        style: null,
        blocks: ["columns-media"],
        defaultContent: []
      },
      {
        id: "section-6",
        name: "Knowledge Hub heading",
        selector: ".white-background > div:nth-child(5)",
        style: null,
        blocks: [],
        defaultContent: [".white-background > div:nth-child(5)"]
      },
      {
        id: "section-7",
        name: "Knowledge Hub content",
        selector: ".white-background > div:nth-child(6)",
        style: null,
        blocks: ["columns-media"],
        defaultContent: []
      },
      {
        id: "section-8",
        name: "Need Help",
        selector: ".white-background > div:nth-child(7)",
        style: null,
        blocks: ["cards-help"],
        defaultContent: []
      },
      {
        id: "section-9",
        name: "App/promo cards (row 1)",
        selector: ".white-background > div:nth-child(8)",
        style: null,
        blocks: ["cards-product"],
        defaultContent: []
      },
      {
        id: "section-10",
        name: "App/promo cards (row 2) + Rates & Charges",
        selector: ".white-background > div:nth-child(9)",
        style: null,
        blocks: ["cards-product", "tabs-rates"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
  function forceLazyImages(root) {
    const normalize = (u) => u ? u.replace(/\.transform\/[^?#]*/i, "") : u;
    const firstUrl = (srcset) => srcset ? normalize(srcset.split(",")[0].trim().split(/\s+/)[0]) : "";
    root.querySelectorAll("source").forEach((source) => {
      const ss = source.getAttribute("srcset") || "";
      const dss = source.getAttribute("data-srcset") || "";
      if ((!ss || ss.trim() === "") && dss) source.setAttribute("srcset", firstUrl(dss));
      else if (ss) source.setAttribute("srcset", firstUrl(ss));
    });
    root.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      const hasRealSrc = src.trim() !== "" && !src.startsWith("data:");
      if (hasRealSrc) {
        img.setAttribute("src", normalize(src));
        return;
      }
      let resolved = "";
      ["data-originalsrc", "data-src", "data-original", "data-lazy-src"].some((attr) => {
        const v = img.getAttribute(attr);
        if (v && v.trim() !== "" && !v.trim().startsWith("data:")) {
          resolved = v.trim();
          return true;
        }
        return false;
      });
      if (!resolved) resolved = firstUrl(img.getAttribute("data-srcset") || img.getAttribute("srcset") || "");
      if (resolved) img.setAttribute("src", normalize(resolved));
    });
  }
  var import_home_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      forceLazyImages(main);
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
