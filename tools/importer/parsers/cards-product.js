/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base: cards.
 * Source: https://www.kotak.bank.in/en/home.html
 *   (div.columncontrol.section — product / app-promo card grids)
 * Generated for Kotak home migration (DA project).
 *
 * Block table: 2 columns, N rows.
 *   row 1: block name
 *   each card row: [ image, text (eyebrow / heading / description / CTA link) ]
 *
 * Source notes:
 *   - Grid is built from columns (`.col-md-4`). Each column holds several
 *     `.hp-main-box` cards but only the one WITHOUT `.hidden` is shown
 *     (the others are alternates rotated by "random logic"). We export the
 *     visible card per column → one card per row.
 *   - Card image: `img.em-img`. Eyebrow: `.em-sub-title`. Heading: `h4.em-title`.
 *     Description: `.em-desc`. CTA: `a.em-cta` (labelled link, e.g. "Apply Now").
 *   - An empty overlay anchor `a.link-card` wraps the card; it is excluded so the
 *     card body does not get an empty/duplicate link.
 */
// Fallback card image map (heading/eyebrow text → asset URL). The home page's
// product and promo card images are injected by client-side personalization JS
// that does not execute during headless import capture, so the <img> nodes are
// absent from the captured DOM. These URLs were collected from the source's raw
// HTML (all card variants' data-originalsrc / data-srcset, normalized to the
// base asset). Used only when a card has no in-DOM image to resolve.
const CARD_IMAGE_FALLBACK = {
  'step up with the right savings account': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/everyday-sa-feature-cad-t.jpg',
  'backing you with every swipe': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/811-super.jpeg',
  'hassle free home loans tailored for your needs!': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/home-loan-feature-card.jpg',
  'enjoy exclusive offers with kotak credit cards': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/cc-card-358-x-201.jpg',
  'your goals need systematic investments': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/mutual-funds-feature-card-t.jpg',
  'save, trade, & invest smartly': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/3-in-1-trinity-t.jpg',
  'dissolving distances. powering ambitions': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/nri-services-feature-card-t.jpg',
  'power your aspirations with personal loans': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/pl-feature-card-t.jpg',
  'power your entrepreneurial dreams': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/current-account-feature-card-t.jpg',
  'not enough funds for your business dreams?': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/business-capital-feature-card-t.jpg',
  'hausla empowered': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/bizlabs-docuseries-feature-card.jpg',
  'pay in a flash!': 'https://www.kotak.bank.in/content/dam/Kotak/Product-Card-Images-Mobile/bhim-upi-feat-card.jpg',
  'mobile banking that keeps up with you': 'https://www.kotak.bank.in/content/dam/Kotak/product_card_images/kotak-mobile-banking.jpg',
  'ask for your ckyc identifier today!': 'https://www.kotak.bank.in/content/dam/Kotak/Product-Card-Images-Mobile/ckyc-t.jpg',
  'join us in the #maukaganwao campaign': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/MaukaGanwao.jpg',
  lg: 'https://www.kotak.bank.in/content/dam/Kotak/deals-offers/electronics/cc-emi/lg-offer-t.jpg',
  'tune in to channel red': 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/Channel-Red.jpg',
};

export default function parse(element, { document }) {
  const cells = [];

  // Resolve the best real image URL from a (possibly lazy-loaded) <img>.
  // The product grid lazy-loads via several attributes and the live page
  // personalizes which card variant is shown (`unica-personlization`,
  // round-robin), so a box may carry the URL on data-srcset/data-originalsrc
  // rather than src.
  const resolveImageUrl = (img) => {
    if (!img) return '';
    const candidates = [
      img.getAttribute('src'),
      img.getAttribute('data-src'),
      img.getAttribute('data-original'),
      img.getAttribute('data-originalsrc'),
      img.getAttribute('data-lazy-src'),
    ].filter(Boolean);
    // Normalize AEM static-rendition URLs (e.g.
    // ".../everyday-sa-feature-cad-t.jpg.transform/transformer-width-737-height-414/image.jpg")
    // back to their base asset URL. The rendition path's double extension trips
    // up the importer's image downloader, so the card image gets dropped; the
    // base URL (".../everyday-sa-feature-cad-t.jpg") serves the same asset and
    // imports reliably.
    const normalize = (u) => (u ? u.replace(/\.transform\/[^?#]*/i, '') : u);

    // Prefer a non-placeholder URL (skip 1x1 / inline data-URI placeholders).
    const real = candidates.find((u) => u && !u.startsWith('data:'));
    if (real) return normalize(real);
    // Fall back to the first srcset entry if present.
    const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
    if (srcset) return normalize(srcset.split(',')[0].trim().split(/\s+/)[0]);
    return normalize(candidates.find((u) => u && !u.startsWith('data:')) || '');
  };

  // Does this card box yield a resolvable (non-placeholder) image?
  const boxHasImage = (box) => {
    const img = box.querySelector('img.em-img, img.img-responsive, picture img, img');
    return !!resolveImageUrl(img);
  };

  // Pick the best card box from a column: prefer the one that actually has a
  // resolvable image (personalization rotates which box is "visible", and the
  // chosen one sometimes has no usable image URL at import time), then the
  // non-hidden box, then the first.
  const pickBox = (boxes) => boxes.find((b) => !b.classList.contains('hidden') && boxHasImage(b))
    || boxes.find((b) => boxHasImage(b))
    || boxes.find((b) => !b.classList.contains('hidden'))
    || boxes[0];

  // Find a resolvable image for a card. The live page personalizes which card
  // variant is shown and may strip the <img> of the active box, so if the
  // chosen card has no usable image, fall back to any sibling box image in the
  // same column (the hidden variants carry the same asset). This keeps image
  // extraction deterministic across the site's round-robin personalization.
  const findCardImage = (card, col) => {
    const own = card.querySelector('img.em-img, img.img-responsive, picture img, img');
    if (own && resolveImageUrl(own)) return own;
    if (col) {
      const sibling = Array.from(col.querySelectorAll('img.em-img, img.img-responsive, picture img, img'))
        .find((im) => resolveImageUrl(im));
      if (sibling) return sibling;
    }
    return own;
  };

  // Candidate card containers. Prefer the visible card per column.
  // Track each card's owning column so image resolution can fall back to
  // sibling box variants.
  let cardEls = [];
  const cardCols = new Map();
  const columns = Array.from(element.querySelectorAll('.col-md-4, [class*="col-4-4-4"]'));
  if (columns.length) {
    columns.forEach((col) => {
      // Skip the Rates & Charges column — that is handled by the tabs-rates
      // block, which shares this same container. Without this guard the rate
      // panel would be mis-parsed as a card and consumed before tabs-rates runs.
      if (col.querySelector('.ratecardwrapper, .ratecard')) return;
      const boxes = Array.from(col.querySelectorAll('.hp-main-box'));
      const chosen = pickBox(boxes);
      if (chosen) { cardEls.push(chosen); cardCols.set(chosen, col); }
    });
  }
  // Fallback: any non-hidden card box, else generic card markup.
  if (!cardEls.length) {
    cardEls = Array.from(element.querySelectorAll('.hp-main-box:not(.hidden)'));
  }
  if (!cardEls.length) {
    cardEls = Array.from(element.querySelectorAll('.main-white-box, [class*="card"]'));
  }

  cardEls.forEach((card) => {
    const img = findCardImage(card, cardCols.get(card));
    const eyebrow = card.querySelector('.em-sub-title, .info-title');
    const heading = card.querySelector('h4.em-title, .em-title, h2, h3, h4, h5');
    const desc = card.querySelector('.em-desc, .info-box');
    // Use the labelled CTA, not the empty overlay anchor (a.link-card).
    const cta = card.querySelector('a.em-cta')
      || card.querySelector('.link-box a[href]')
      || card.querySelector('a.em-link:not(.link-card)');

    if (!img && !eyebrow && !heading && !desc) return;

    // Build a clean <img> (inside a <picture>) with the resolved real URL so the
    // importer reliably emits the image even when the source uses lazy-loading.
    let url = img ? resolveImageUrl(img) : '';
    let altText = img ? (img.getAttribute('alt') || img.getAttribute('title') || '') : '';

    // Fallback for personalization-injected cards whose image is absent from the
    // captured DOM: look up the asset URL by the card's heading or eyebrow text.
    if (!url) {
      const headText = (heading && heading.textContent ? heading.textContent : '').trim().toLowerCase();
      const eyebrowText = (eyebrow && eyebrow.textContent ? eyebrow.textContent : '').trim().toLowerCase();
      url = CARD_IMAGE_FALLBACK[headText] || CARD_IMAGE_FALLBACK[eyebrowText] || '';
      if (url && !altText) altText = (heading && heading.textContent ? heading.textContent : eyebrow && eyebrow.textContent ? eyebrow.textContent : '').trim();
    }

    let imageCell = '';
    if (url) {
      const newImg = document.createElement('img');
      newImg.setAttribute('src', url);
      if (altText) newImg.setAttribute('alt', altText);
      const picture = document.createElement('picture');
      picture.append(newImg);
      imageCell = picture;
    }

    const body = [];
    if (eyebrow) body.push(eyebrow);
    if (heading) body.push(heading);
    if (desc) body.push(desc);
    if (cta) {
      // Strip trailing icon nodes so the link renders as clean text.
      cta.querySelectorAll('i, svg').forEach((n) => n.remove());
      body.push(cta);
    }

    cells.push([imageCell, body.length ? body : '']);
  });

  // Detect whether this container also holds a Rates & Charges panel
  // (section 9 shares one container between promo cards and tabs-rates).
  const rateCol = element.querySelector('.ratecardwrapper, .ratecard');

  if (!cells.length) {
    if (!rateCol) element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });

  if (rateCol) {
    // Shared container: insert the cards block before the rate panel and remove
    // only the card columns, leaving the rate panel for the tabs-rates parser.
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
