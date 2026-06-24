/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-help. Base block: cards.
 * Source: https://www.kotak.bank.in/en/home.html (.white-background > div:nth-child(7))
 * Generated for Kotak home page (DA project).
 *
 * "Need Help?" icon tiles (Visit Help Center, Contact us, Locate us, Report a fraud,
 * Lodge a complaint, Block lost/stolen card).
 * Block table: 2 columns, N rows (one tile per row): [icon image] | [title link + description].
 * Skips Owl Carousel ".cloned" duplicate tiles.
 */

const BASE_URL = 'https://www.kotak.bank.in';

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
  return url.replace(/\.transform\/[^?#]*/i, '');
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

export default function parse(element, { document }) {
  let tiles = Array.from(element.querySelectorAll('.owl-item:not(.cloned)'));
  if (!tiles.length) {
    tiles = Array.from(element.querySelectorAll('.iconsider-large, a.iconsider-large-a'));
  }

  const cells = [];
  const seenTitles = new Set();
  tiles.forEach((tile) => {
    const img = tile.querySelector('img');
    const url = resolveImageUrl(img);
    const titleEl = tile.querySelector('.iconsider-title, h1, h2, h3, h4, h5, h6, [class*="title"]');
    const descEl = tile.querySelector('.iconsider-dec, p, [class*="dec"], [class*="desc"]');
    const linkEl = tile.querySelector('a[href]');

    const titleText = textOf(titleEl);
    if (!titleText && !url) return;
    // Guard against duplicate tiles if clones slipped through.
    if (titleText && seenTitles.has(titleText)) return;
    if (titleText) seenTitles.add(titleText);

    // Icon cell
    let iconCell = '';
    if (url) {
      const newImg = document.createElement('img');
      newImg.src = url;
      const alt = (img.getAttribute('alt') || img.getAttribute('title') || titleText || '').trim();
      if (alt) newImg.alt = alt;
      iconCell = newImg;
    }

    // Body cell: title linked + description
    const body = [];
    if (titleText) {
      const href = linkEl && linkEl.getAttribute('href');
      const heading = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = absolutize(href);
        a.textContent = titleText;
        heading.append(a);
      } else {
        heading.textContent = titleText;
      }
      body.push(heading);
    }
    if (descEl && textOf(descEl)) {
      const p = document.createElement('p');
      p.textContent = textOf(descEl);
      body.push(p);
    }

    cells.push([iconCell, body.length ? body : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-help', cells });
  element.replaceWith(block);
}
