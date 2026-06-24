/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base block: columns.
 * Source: https://www.kotak.bank.in/en/home.html
 *   instances: .white-background > div:nth-child(4)  (Video + Hausla)
 *              .white-background > div:nth-child(6)  (Knowledge Hub)
 * Generated for Kotak home page (DA project).
 *
 * Flexible block: row 1 = block name; one content row whose cells become columns.
 * Two real layouts handled by the same generic column-extraction logic:
 *  - Video + Hausla: [video poster image (linked to YouTube) + play] | [image + heading + text].
 *  - Knowledge Hub: [featured story image + heading + Read more] | [Stories-in-focus link list + View all].
 *
 * Image handling: resolve src -> data-src -> data-original -> data-originalsrc ->
 *   data-lazy-src -> data-srcset(first), skip data: placeholders, normalize AEM renditions.
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

// Find the nearest enclosing anchor (for a poster image / linked thumbnail).
function enclosingLink(el, column) {
  let node = el.parentElement;
  while (node && node !== column) {
    if (node.tagName === 'A' && node.getAttribute('href')) return node;
    node = node.parentElement;
  }
  return null;
}

// Extract a column's meaningful content in document order, de-duplicating.
function extractColumn(column, document) {
  const content = [];
  const usedTexts = new Set();
  const usedImgUrls = new Set();

  // 1. Images (resolved, wrapped in their link if any). Skip data: placeholders.
  column.querySelectorAll('img').forEach((img) => {
    // Skip small decorative per-item list icons in link lists (e.g. "Stories in focus");
    // the link text already conveys each item.
    if (img.closest('.mf-list-item, .mf-list, li') || img.classList.contains('mf-list-icon')) return;
    const url = resolveImageUrl(img);
    if (!url || usedImgUrls.has(url)) return;
    usedImgUrls.add(url);
    const newImg = document.createElement('img');
    newImg.src = url;
    const alt = (img.getAttribute('alt') || img.getAttribute('title') || '').trim();
    if (alt) newImg.alt = alt;
    const link = enclosingLink(img, column);
    if (link) {
      const a = document.createElement('a');
      a.href = absolutize(link.getAttribute('href'));
      a.append(newImg);
      content.push(a);
    } else {
      content.push(newImg);
    }
  });

  // 2. Headings.
  column.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    const t = textOf(h);
    if (!t || usedTexts.has(t)) return;
    usedTexts.add(t);
    const heading = document.createElement(h.tagName.toLowerCase());
    heading.textContent = t;
    content.push(heading);
  });

  // 3. Paragraph / descriptive text (non-link copy).
  column.querySelectorAll('p').forEach((p) => {
    const t = textOf(p);
    if (!t || usedTexts.has(t)) return;
    // Skip pure-link paragraphs; their anchors are captured below.
    if (p.querySelector('a') && p.textContent.replace(/\s+/g, '') === (p.querySelector('a').textContent || '').replace(/\s+/g, '')) return;
    usedTexts.add(t);
    const para = document.createElement('p');
    para.textContent = t;
    content.push(para);
  });

  // 4. Text links (CTAs / story links) — skip anchors that only wrap an image.
  column.querySelectorAll('a[href]').forEach((a) => {
    const t = textOf(a);
    if (!t) return; // image-only links already handled
    // Skip "wrapper" anchors that enclose a heading or multiple block elements
    // (these concatenate eyebrow + heading + CTA into one giant link).
    if (a.querySelector('h1, h2, h3, h4, h5, h6') || a.querySelector('p + p')) return;
    // Skip anchor whose text duplicates an already-captured heading/paragraph.
    if (usedTexts.has(t)) return;
    const key = `${t}|${a.getAttribute('href')}`;
    if (usedTexts.has(key)) return;
    usedTexts.add(key);
    const link = document.createElement('a');
    link.href = absolutize(a.getAttribute('href'));
    link.textContent = t;
    content.push(link);
  });

  return content;
}

export default function parse(element, { document }) {
  const row = element.querySelector('.row, [class*="row"]') || element;
  let columns = Array.from(row.querySelectorAll(':scope > [class*="col-"]'));
  if (!columns.length) {
    columns = Array.from(element.querySelectorAll('[class*="col-md"], [class*="col-sm"]'));
  }
  if (!columns.length) columns = [element];

  const rowCells = [];
  columns.forEach((column) => {
    const content = extractColumn(column, document);
    rowCells.push(content.length ? content : '');
  });

  // Drop trailing empty columns; require at least one with content.
  if (!rowCells.some((c) => c && c !== '')) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [rowCells];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
