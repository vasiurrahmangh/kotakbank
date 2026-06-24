/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base block: carousel.
 * Source: https://www.kotak.bank.in/en/home.html (.heroslider.section)
 * Generated for Kotak home page (DA project).
 *
 * Block table: 2 columns, N rows.
 *  - Row 1: block name (handled by createBlock).
 *  - Each subsequent row = one real slide: [image] | [heading + description + CTA].
 * Skips Owl Carousel ".cloned" duplicate slides so each real slide appears once.
 */

// Resolve the real image URL across lazy-load patterns and normalize AEM renditions.
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
  // Normalize AEM rendition URLs: strip ".transform/.../image.ext" suffix.
  url = url.replace(/\.transform\/[^?#]*/i, '');
  return url;
}

function buildImage(slide, document) {
  const img = slide.querySelector('picture img, img');
  const url = resolveImageUrl(img);
  if (!url) return img || null;
  const newImg = document.createElement('img');
  newImg.src = url;
  const alt = (img && (img.getAttribute('alt') || img.getAttribute('title'))) || '';
  if (alt) newImg.alt = alt;
  return newImg;
}

export default function parse(element, { document }) {
  // One real slide per non-cloned owl item; fall back to any direct slide items.
  let slides = Array.from(element.querySelectorAll('.owl-item:not(.cloned)'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll('.hero-carousel-item, .item'));
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

    const ctas = Array.from(slide.querySelectorAll('a.btn, .btn-box a, a.btn-primary'));
    // De-duplicate CTAs that match multiple selectors.
    const seen = new Set();
    ctas.forEach((a) => {
      if (!seen.has(a)) {
        seen.add(a);
        contentCell.push(a);
      }
    });

    // Only add a row if the slide has any content (image or text).
    if (imageCell || contentCell.length) {
      cells.push([imageCell || '', contentCell.length ? contentCell : '']);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
