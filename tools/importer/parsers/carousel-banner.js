/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-banner. Base block: carousel.
 * Source: https://www.kotak.bank.in/en/home.html (.thincarousalbanner.section)
 * Generated for Kotak home page (DA project).
 *
 * Slim helpline / promo banner carousel (e.g. "1800 4100").
 * Block table: 2 columns, N rows.
 *  - Row 1: block name (handled by createBlock).
 *  - Each subsequent row = one real slide: [image (wrapped in slide link if present)] | [optional text].
 * Skips Owl Carousel ".cloned" duplicate slides.
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
  url = url.replace(/\.transform\/[^?#]*/i, '');
  return url;
}

function absolutize(href) {
  if (!href) return href;
  if (/^https?:\/\//i.test(href) || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return href;
  if (href.startsWith('/')) return BASE_URL + href;
  return href;
}

export default function parse(element, { document }) {
  let slides = Array.from(element.querySelectorAll('.owl-item:not(.cloned)'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll('.owlcarousal-slide, .item'));
  }
  if (!slides.length) slides = [element];

  const cells = [];
  slides.forEach((slide) => {
    const img = slide.querySelector('picture img, img');
    const url = resolveImageUrl(img);

    let imageCell = '';
    if (url) {
      const newImg = document.createElement('img');
      newImg.src = url;
      const alt = (img.getAttribute('alt') || img.getAttribute('title') || '').trim();
      if (alt && alt.toLowerCase() !== 'image is broken') newImg.alt = alt;

      // Preserve the slide link wrapping the image.
      const link = slide.querySelector('a[href]');
      if (link && link.getAttribute('href')) {
        const a = document.createElement('a');
        a.href = absolutize(link.getAttribute('href'));
        a.append(newImg);
        imageCell = a;
      } else {
        imageCell = newImg;
      }
    } else if (img) {
      imageCell = img;
    }

    // Optional text content (slim banners are usually image-only).
    const textCell = [];
    const heading = slide.querySelector('h1, h2, h3, [class*="title"]');
    if (heading) textCell.push(heading);
    const desc = slide.querySelector('p, [class*="desc"]');
    if (desc && desc.textContent.trim()) textCell.push(desc);

    if (imageCell || textCell.length) {
      cells.push([imageCell || '', textCell.length ? textCell : '']);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-banner', cells });
  element.replaceWith(block);
}
