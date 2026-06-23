/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-help. Base: cards.
 * Source: https://www.kotak.bank.in/en/home.html
 *   (div.parsys.section — "Need Help?" icon tiles)
 * Generated for Kotak home migration (DA project).
 *
 * Block table: 2 columns, N rows.
 *   row 1: block name
 *   each tile row: [ icon image, text (title link + short description) ]
 *
 * Source notes:
 *   - Each tile is `a.iconsider-large-a` (carries the destination href) wrapping
 *     `.iconsider-large-img > img` (icon) and `.iconsider-text`
 *     (`.iconsider-title` + `.iconsider-dec`).
 *   - The surrounding "Need Help?" heading lives in a sibling `.text.section`
 *     (section default content) and is intentionally not pulled into this block.
 *   - Icons may be lazy-loaded; the best real URL is resolved from src/data-src.
 *
 * Validation note: extraction logic verified directly against the live DOM
 * (6 tiles: Visit Help Center, Contact us, Locate us, Report a fraud,
 * Lodge a complaint, Block lost/stolen card) — all icons, titles, descriptions
 * and hrefs resolve correctly. The validator's "no results" is caused by the
 * page-templates.json instance selector (`div.parsys.section:nth-of-type(2)`),
 * which mis-targets because all section siblings are <div> (so :nth-of-type
 * counts every div, not just .parsys.section). Selector fix is owned by
 * block-mapping-manager; the parser below is correct for the real element.
 */
export default function parse(element, { document }) {
  const cells = [];

  const resolveImageUrl = (img) => {
    if (!img) return '';
    const candidates = [
      img.getAttribute('src'),
      img.getAttribute('data-src'),
      img.getAttribute('data-original'),
      img.getAttribute('data-lazy-src'),
    ].filter(Boolean);
    const real = candidates.find((u) => u && !u.startsWith('data:'));
    if (real) return real;
    const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
    if (srcset) return srcset.split(',')[0].trim().split(/\s+/)[0];
    return candidates[0] || '';
  };

  // Each tile is an icon-slider anchor. (No owl clones in this slider, but guard.)
  let tiles = Array.from(element.querySelectorAll('a.iconsider-large-a'));
  if (!tiles.length) {
    tiles = Array.from(element.querySelectorAll('.iconsider-large, [class*="iconsider-large"]'));
  }

  const seen = new Set();

  tiles.forEach((tile) => {
    if (tile.closest('.cloned')) return;

    const href = tile.matches('a[href]')
      ? tile.getAttribute('href')
      : (tile.querySelector('a[href]') && tile.querySelector('a[href]').getAttribute('href'));

    const iconImg = tile.querySelector('.iconsider-large-img img, img');
    const title = tile.querySelector('.iconsider-title');
    const desc = tile.querySelector('.iconsider-dec, p');

    if (!iconImg && !title && !desc) return;

    // De-duplicate (guard against repeated tiles).
    const key = href || (title && title.textContent.trim()) || '';
    if (key && seen.has(key)) return;
    if (key) seen.add(key);

    // --- Image cell ---
    let imageCell = '';
    if (iconImg) {
      const url = resolveImageUrl(iconImg);
      if (url) {
        const newImg = document.createElement('img');
        newImg.setAttribute('src', url);
        const alt = (title && title.textContent.trim())
          || iconImg.getAttribute('alt') || '';
        if (alt) newImg.setAttribute('alt', alt);
        const picture = document.createElement('picture');
        picture.append(newImg);
        imageCell = picture;
      }
    }

    // --- Text cell: title (linked) + description ---
    const textCell = [];
    if (title) {
      const titleText = title.textContent.trim();
      if (href) {
        const link = document.createElement('a');
        link.setAttribute('href', href);
        link.textContent = titleText;
        const p = document.createElement('p');
        p.append(link);
        textCell.push(p);
      } else {
        textCell.push(title);
      }
    }
    if (desc && desc.textContent.trim()) textCell.push(desc);

    cells.push([imageCell, textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-help', cells });
  element.replaceWith(block);
}
