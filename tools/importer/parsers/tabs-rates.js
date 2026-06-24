/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-rates. Base block: tabs.
 * Source: https://www.kotak.bank.in/en/home.html
 *   instance: .white-background > div:nth-child(9) .ratecardwrapper.section
 * Generated for Kotak home page (DA project).
 *
 * "Rates & Charges" tabbed panel. Block table: 2 columns, N rows.
 *  - Row 1: block name (handled by createBlock).
 *  - Each subsequent row = one tab: [tab label] | [tab content (rate rows + text)].
 * Tabs: Deposits, Savings Account, Loans. Trailing "See all rates" link appended to the
 * last panel.
 */

const BASE_URL = 'https://www.kotak.bank.in';

function absolutize(href) {
  if (!href) return href;
  if (/^https?:\/\//i.test(href) || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return href;
  if (href.startsWith('/')) return BASE_URL + href;
  return href;
}

function textOf(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

// Extract the tab label from the ratecard header (figure img + label + arrow icon).
function tabLabel(card) {
  const header = card.querySelector('h2, .target, [class*="title"]');
  if (!header) return '';
  // Prefer the header anchor's own text (excludes the decorative figure/icon).
  const anchor = header.querySelector('a') || header;
  const direct = Array.from(anchor.childNodes)
    .filter((n) => n.nodeType === 3)
    .map((n) => n.textContent.replace(/\s+/g, ' ').trim())
    .join(' ')
    .trim();
  return direct || textOf(anchor);
}

// Build the panel content: rate rows ("<rate> <name link>") plus any sub-headings.
function tabContent(card, document) {
  const out = [];
  const panel = card.querySelector('.toggle-ctnt, [class*="toggle"]') || card;

  // Iterate descendant <p> in order: bold sub-headings and rate rows.
  panel.querySelectorAll('p').forEach((p) => {
    const t = textOf(p);
    if (!t) return;
    const rateEl = p.querySelector('.FR, [class*="FR"], span');
    const linkEl = p.querySelector('a[href]');
    if (rateEl && linkEl) {
      // Rate row: "<rate>  <name>(link)"
      const para = document.createElement('p');
      const rate = document.createElement('strong');
      rate.textContent = textOf(rateEl);
      para.append(rate);
      para.append(document.createTextNode(' '));
      const a = document.createElement('a');
      a.href = absolutize(linkEl.getAttribute('href'));
      a.textContent = textOf(linkEl);
      para.append(a);
      out.push(para);
    } else if (p.querySelector('strong') && t) {
      // Bold sub-heading (e.g. "Fixed Deposit (15 months ...)").
      const para = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = t;
      para.append(strong);
      out.push(para);
    } else if (linkEl) {
      const a = document.createElement('a');
      a.href = absolutize(linkEl.getAttribute('href'));
      a.textContent = t;
      out.push(a);
    } else {
      const para = document.createElement('p');
      para.textContent = t;
      out.push(para);
    }
  });
  return out;
}

export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('.ratecard.section, .ratecard'));

  const cells = [];
  cards.forEach((card) => {
    const label = tabLabel(card);
    const content = tabContent(card, document);
    if (!label && !content.length) return;
    cells.push([label || '', content.length ? content : '']);
  });

  // Append trailing "See all rates" link to the last tab's content.
  const seeAll = element.querySelector('.main-white-box > .link-box a[href], .link-box a[href]');
  if (seeAll && cells.length) {
    const a = document.createElement('a');
    a.href = absolutize(seeAll.getAttribute('href'));
    a.textContent = textOf(seeAll);
    const lastContent = cells[cells.length - 1][1];
    if (Array.isArray(lastContent)) {
      lastContent.push(a);
    } else {
      cells[cells.length - 1][1] = [a];
    }
  }

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-rates', cells });
  element.replaceWith(block);
}
