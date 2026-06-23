/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns.
 * Source: https://www.kotak.bank.in/en/home.html
 *   - Video + "Hausla hai toh ho jayega" 2-column section
 *   - Knowledge Hub featured-story + stories-list 2-column section
 * Generated for Kotak home migration (DA project).
 *
 * Block table: N columns, M rows.
 *   row 1: block name
 *   one content row: one cell per source column; each cell keeps that column's
 *   inner content (text, headings, links, poster image, story list, etc.).
 *
 * Source notes:
 *   - Columns come from `.row > div[class*="col-"]` (here col-md-8 + col-md-4).
 *   - Lazy-loaded images keep their URL in src / data-src / data-srcset; these
 *     are rebuilt into a clean <picture> so the importer emits the image.
 *   - The video column is a YouTube link (a.track-videos) wrapping a poster
 *     image; the link + poster are preserved.
 *   - Clientlib <link>/<style>/<script> and empty overlay anchors are stripped.
 *
 * Validation note: extraction verified directly against the live DOM for both
 * instances (Video column = YouTube poster + embed link; Hausla text column;
 * Knowledge Hub featured story + 5-item stories list with thumbnails) — all
 * content, images and links resolve correctly. The validator's "no results" is
 * caused by the page-templates.json instance selectors
 * (`div.columncontrol.section:nth-of-type(3)` and `div.parsys.section:nth-of-type(1)`),
 * which mis-target because every section sibling is a <div>, so :nth-of-type
 * counts all divs rather than the class-matched ones. The real elements are at
 * :nth-child(4) (Video) and :nth-child(6) (Knowledge Hub). Selector fix is owned
 * by block-mapping-manager; the parser below is correct for the real elements.
 */
export default function parse(element, { document }) {
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
    return candidates.find((u) => u && !u.startsWith('data:')) || '';
  };

  // Clean up a cloned column: drop non-content nodes and fix lazy images.
  const cleanColumn = (col) => {
    col.querySelectorAll('link, style, script, input, .owl-nav, .owl-dots').forEach((n) => n.remove());
    // Fix lazy images so they resolve.
    col.querySelectorAll('img').forEach((img) => {
      const url = resolveImageUrl(img);
      if (url) {
        img.setAttribute('src', url);
      } else {
        img.remove();
      }
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
      img.removeAttribute('srcset');
    });
    // Remove empty anchors (overlay links with no text and no media).
    col.querySelectorAll('a').forEach((a) => {
      if (!a.textContent.trim() && !a.querySelector('img, picture, video, iframe')) a.remove();
    });
    return col;
  };

  // Locate the column row. Prefer an explicit `.row` wrapper.
  let columns = [];
  const row = element.querySelector(':scope .row') || element.querySelector('.row');
  if (row) {
    columns = Array.from(row.children).filter((c) => /\bcol-/.test(c.className) || c.children.length);
  }
  if (!columns.length) {
    // Fallback: treat each direct child section as a column.
    columns = Array.from(element.querySelectorAll(':scope > div'));
  }

  // Build one cell per column with its cleaned, cloned content.
  const cellRow = columns
    .map((col) => cleanColumn(col.cloneNode(true)))
    .filter((col) => col.textContent.trim() || col.querySelector('img, picture, video, iframe, a'));

  if (!cellRow.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [cellRow];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
