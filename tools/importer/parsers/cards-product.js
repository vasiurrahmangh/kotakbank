/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base block: cards.
 * Source: https://www.kotak.bank.in/en/home.html
 *   instances: .white-background > div:nth-child(1|2|8|9)
 * Generated for Kotak home page (DA project).
 *
 * Block table: 2 columns, N rows (one card per row): [image] | [eyebrow + heading + description + CTA].
 *
 * Pixel-perfect image handling:
 *  - Images lazy-load: resolve src -> data-src -> data-original -> data-originalsrc ->
 *    data-lazy-src -> data-srcset(first), skipping data: placeholders.
 *  - Normalize AEM rendition URLs by stripping ".transform/...".
 *  - Personalization shows one card variant per column: pick the visible .hp-main-box
 *    (without "hidden"); if its image fails to resolve, fall back to a sibling box image.
 *  - Some images are injected by personalization JS and missing from captured DOM:
 *    a heading/eyebrow -> asset-URL fallback map guarantees every card gets its image.
 *  - When an instance shares its container with the Rates & Charges panel
 *    (.ratecardwrapper/.ratecard), SKIP that column so tabs-rates can claim it; insert the
 *    cards block before the rate column and remove only the card columns.
 */

const BASE_URL = 'https://www.kotak.bank.in';

// heading or eyebrow (lowercased, trimmed) -> correct asset URL.
const IMAGE_FALLBACK = {
  'step up with the right savings account': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/everyday-sa-feature-cad-t.jpg',
  'hassle free home loans tailored for your needs!': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/home-loan-feature-card.jpg',
  'dissolving distances. powering ambitions': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/nri-services-feature-card-t.jpg',
  'power your entrepreneurial dreams': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/current-account-feature-card-t.jpg',
  'not enough funds for your business dreams?': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/business-capital-feature-card-t.jpg',
  'hausla empowered': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/bizlabs-docuseries-feature-card.jpg',
  'pay in a flash!': 'https://www.kotak.bank.in/content/dam/Kotak/Product-Card-Images-Mobile/bhim-upi-feat-card.jpg',
  'mobile banking that keeps up with you': 'https://www.kotak.bank.in/content/dam/Kotak/product_card_images/kotak-mobile-banking.jpg',
  'ask for your ckyc identifier today!': 'https://www.kotak.bank.in/content/dam/Kotak/Product-Card-Images-Mobile/ckyc-t.jpg',
  'lg': 'https://www.kotak.bank.in/content/dam/Kotak/deals-offers/electronics/cc-emi/lg-offer-t.jpg',
  'tune in to channel red': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/Channel-Red.jpg',
};

function normalizeRendition(url) {
  if (!url) return url;
  return url.replace(/\.transform\/[^?#]*/i, '');
}

function resolveImageUrl(img) {
  if (!img) return null;
  const candidates = [
    img.getAttribute('src'),
    img.getAttribute('data-src'),
    img.getAttribute('data-original'),
    img.getAttribute('data-originalsrc'),
    img.getAttribute('data-lazy-src'),
  ];
  const srcset = img.getAttribute('data-srcset') || img.getAttribute('srcset');
  if (srcset) {
    const first = srcset.split(',')[0].trim().split(/\s+/)[0];
    if (first) candidates.push(first);
  }
  let url = candidates.find((c) => c && !c.startsWith('data:'));
  if (!url) return null;
  return normalizeRendition(url);
}

function absolutize(href) {
  if (!href) return href;
  if (/^https?:\/\//i.test(href) || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return href;
  if (href.startsWith('/')) return BASE_URL + href;
  return href;
}

function textOf(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

// Build the [image, body] cell pair for a single visible card box.
function buildCard(box, column, document) {
  const eyebrowEl = box.querySelector('.info-title, .em-sub-title, [class*="sub-title"]');
  const headingEl = box.querySelector('h1, h2, h3, h4, h5, h6, .em-title, [class*="title"]:not(.info-title):not(.em-sub-title)');
  const descEl = box.querySelector('.info-box, .em-desc, [class*="desc"]');
  const ctaEl = box.querySelector('a.em-cta, .link-box a, a.em-link');

  const eyebrowText = textOf(eyebrowEl).toLowerCase();
  const headingText = textOf(headingEl).toLowerCase();

  // Resolve the image, preferring the visible box then any sibling in the column.
  let url = resolveImageUrl(box.querySelector('img'));
  if (!url && column) {
    const siblingImgs = Array.from(column.querySelectorAll('.hp-main-box img'));
    for (const im of siblingImgs) {
      url = resolveImageUrl(im);
      if (url) break;
    }
  }
  // Heading/eyebrow -> asset URL fallback (personalization-injected images).
  if (!url) {
    url = IMAGE_FALLBACK[headingText] || IMAGE_FALLBACK[eyebrowText] || null;
  }

  let imageCell = '';
  if (url) {
    const newImg = document.createElement('img');
    newImg.src = url;
    const srcImg = box.querySelector('img');
    const alt = (srcImg && (srcImg.getAttribute('alt') || srcImg.getAttribute('title'))) || textOf(headingEl) || '';
    if (alt) newImg.alt = alt;
    imageCell = newImg;
  }

  const body = [];
  if (eyebrowEl && textOf(eyebrowEl)) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = textOf(eyebrowEl);
    p.append(strong);
    body.push(p);
  }
  if (headingEl && textOf(headingEl)) {
    const h = document.createElement('h3');
    h.textContent = textOf(headingEl);
    body.push(h);
  }
  if (descEl && textOf(descEl)) {
    const p = document.createElement('p');
    p.textContent = textOf(descEl);
    body.push(p);
  }
  if (ctaEl && textOf(ctaEl)) {
    const a = document.createElement('a');
    a.href = absolutize(ctaEl.getAttribute('href'));
    a.textContent = textOf(ctaEl);
    body.push(a);
  }

  if (!imageCell && !body.length) return null;
  return [imageCell, body.length ? body : ''];
}

export default function parse(element, { document }) {
  // Columns hold one (or more personalization variants of a) product card.
  let columns = Array.from(element.querySelectorAll(':scope .row > [class*="col-"]'));
  if (!columns.length) {
    // Fallback: treat each top-level column-like child as a column.
    columns = Array.from(element.querySelectorAll('[class*="col-md"], [class*="col-xs"]'));
  }

  const cells = [];
  const rateColumns = [];

  columns.forEach((column) => {
    // Skip (and preserve) the Rates & Charges column for tabs-rates.
    if (column.querySelector('.ratecardwrapper, .ratecard')) {
      rateColumns.push(column);
      return;
    }
    // Pick the visible card variant; fall back to first box.
    let box = column.querySelector('.hp-main-box:not(.hidden)');
    if (!box) box = column.querySelector('.hp-main-box');
    if (!box) return;

    const card = buildCard(box, column, document);
    if (card) cells.push(card);
  });

  if (!cells.length) {
    // Nothing to convert (e.g. rate-only container) — leave content intact.
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });

  if (rateColumns.length) {
    // Shared container with the rate panel: insert cards before the rate column,
    // then remove only the card columns so the rate panel stays for tabs-rates.
    const firstRate = rateColumns[0];
    firstRate.parentElement.insertBefore(block, firstRate);
    columns.forEach((column) => {
      if (!column.querySelector('.ratecardwrapper, .ratecard') && column.isConnected) {
        column.remove();
      }
    });
  } else {
    element.replaceWith(block);
  }
}
