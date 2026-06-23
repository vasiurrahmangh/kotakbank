/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-banner. Base: carousel.
 * Source: https://www.kotak.bank.in/en/home.html (.thincarousalbanner.section)
 * Generated for Kotak home migration (DA project).
 *
 * Block table: 2 columns, N rows.
 *   row 1: block name
 *   each slide row: [ image (mandatory), text (optional) ]
 *
 * Source notes:
 *   - Slim helpline/offer banner. Each slide is `.owl-item > .owlcarousal-slide`.
 *   - Owl loop "cloned" slides are duplicates and are skipped.
 *   - Each slide is a clickable banner: `a.cursor-pointer > picture > img.slider-img`.
 *     The anchor is kept as the image cell so the slide link (href) is preserved.
 *   - These banners carry no separate text, so the text cell is left empty.
 */
export default function parse(element, { document }) {
  let slideEls = Array.from(element.querySelectorAll(':scope .owl-item'));
  if (!slideEls.length) {
    slideEls = Array.from(element.querySelectorAll('.owlcarousal-slide'));
  }

  const cells = [];
  const seen = new Set();

  slideEls.forEach((slideEl) => {
    if (slideEl.classList && slideEl.classList.contains('cloned')) return;

    const link = slideEl.querySelector('a.cursor-pointer, a[href]');
    const picture = slideEl.querySelector('picture');
    const img = slideEl.querySelector('img.slider-img, picture img, img');

    if (!picture && !img && !link) return;

    // De-duplicate by image src (guard against repeated non-cloned slides).
    const key = (img && (img.getAttribute('src') || img.getAttribute('data-src'))) || (link && link.getAttribute('href')) || '';
    if (key && seen.has(key)) return;
    if (key) seen.add(key);

    // Prefer the anchor (keeps the slide link); fall back to picture/img.
    let imageCell = picture || img || '';
    if (link && (link.querySelector('picture') || link.querySelector('img'))) {
      imageCell = link;
    }

    cells.push([imageCell, '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-banner', cells });
  element.replaceWith(block);
}
