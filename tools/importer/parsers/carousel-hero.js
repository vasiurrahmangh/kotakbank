/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://www.kotak.bank.in/en/home.html (.heroslider.section)
 * Generated for Kotak home migration (DA project).
 *
 * Block table: 2 columns, N rows.
 *   row 1: block name
 *   each slide row: [ image (mandatory), content (title + description + CTA, optional) ]
 *
 * Source notes:
 *   - Each slide is an `.owl-item` wrapping `.hero-carousel-item`.
 *   - Owl loop "cloned" slides (`.owl-item.cloned`) are duplicates and are skipped.
 *   - Slide image is `picture img.hs-image`; content is `.hero-banner-title`,
 *     `.hero-banner-desc` and `a.btn` CTA.
 *   - A hidden `.modal` (audio popup) inside each slide must be excluded.
 */
export default function parse(element, { document }) {
  // Slide containers: prefer owl-items, fall back to the inner item wrapper.
  let slideEls = Array.from(element.querySelectorAll(':scope .owl-item'));
  if (!slideEls.length) {
    slideEls = Array.from(element.querySelectorAll('.hero-carousel-item, .hero-slider, [class*="hero-banner"]'));
  }

  const cells = [];
  const seenTitles = new Set();

  slideEls.forEach((slideEl) => {
    // Skip owl loop duplicates.
    if (slideEl.classList && slideEl.classList.contains('cloned')) return;

    // Drop the hidden modal/audio popup so it never leaks into the content cell.
    slideEl.querySelectorAll('.modal, audio, .owl-nav, .owl-dots').forEach((n) => n.remove());

    // --- Image cell (mandatory) ---
    const picture = slideEl.querySelector('picture');
    const img = slideEl.querySelector('img.hs-image, picture img, img');

    // --- Content cell (optional) ---
    const title = slideEl.querySelector('h1.hero-banner-title, h2.hero-banner-title, .hero-banner-title, h1, h2, h3');
    const desc = slideEl.querySelector('.hero-banner-desc');
    const ctas = Array.from(slideEl.querySelectorAll('a.btn, .btn-box a, a.btn-primary'));

    // Skip empty slides (no image and no text -> nothing authorable).
    if (!picture && !img && !title && !desc && !ctas.length) return;

    // De-duplicate by title (extra guard against any non-cloned repeats).
    const key = (title && title.textContent.trim()) || (img && img.getAttribute('src')) || '';
    if (key && seenTitles.has(key)) return;
    if (key) seenTitles.add(key);

    const imageCell = picture || img || '';

    const contentCell = [];
    if (title) contentCell.push(title);
    if (desc) contentCell.push(desc);
    ctas.forEach((cta) => contentCell.push(cta));

    cells.push([imageCell, contentCell.length ? contentCell : '']);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
