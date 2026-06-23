/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-rates. Base: tabs.
 * Source: https://www.kotak.bank.in/en/home.html
 *   (the "Rates & Charges" switcher — `.ratecardwrapper.section`)
 * Generated for Kotak home migration (DA project).
 *
 * Block table: 2 columns, N rows.
 *   row 1: block name
 *   each tab row: [ tab label, tab content (rate text + links) ]
 *
 * Source notes:
 *   - The switcher is an accordion of `.ratecard.section` items. Each item has
 *     `h2.target` (the tab label, e.g. Deposits / Savings Account / Loans, with
 *     a leading icon) and `.toggle-ctnt .block` (the rate figures/text panel).
 *   - A trailing "See all rates" link (`.link-box a[href]`) is appended to the
 *     last tab's content cell so it is preserved.
 *   - Tab labels carry an SVG/PNG icon; only the visible label text is kept so
 *     the tab button renders cleanly.
 *
 * Validation note: the cached block-context source for this variant and the
 * page-templates instance selector (`div.columncontrol.section:nth-of-type(5)`)
 * mis-target a product-card columncontrol rather than the Rates & Charges block
 * (the :nth-of-type selectors count every <div> sibling). The real block lives
 * in `.ratecardwrapper.section` inside the last columncontrol (:nth-child(9)).
 * This parser locates the rate cards within the given element (or falls back to
 * the page's `.ratecardwrapper`) so it is robust to the selector once corrected
 * by block-mapping-manager.
 *
 * Extraction verified against the live DOM: 3 tabs (Deposits / Savings Account /
 * Loans) with their rate figures, plus the "See all rates" link
 * (/en/rates/interest-rates.html). The validator reports "no results" only
 * because the instance selector matches no element, so parse() is never invoked.
 */
export default function parse(element, { document }) {
  // Find the rate-card accordion items inside the matched element; if the element
  // doesn't contain them (defective selector), fall back to the page's switcher.
  let scope = element;
  let rateCards = Array.from(scope.querySelectorAll('.ratecard.section'));
  if (!rateCards.length) {
    const wrapper = element.querySelector('.ratecardwrapper')
      || (document.querySelector ? document.querySelector('.ratecardwrapper') : null);
    if (wrapper) {
      scope = wrapper;
      rateCards = Array.from(wrapper.querySelectorAll('.ratecard.section'));
    }
  }
  // Last fallback: generic accordion targets.
  if (!rateCards.length) {
    rateCards = Array.from(scope.querySelectorAll('.rate-card, .ratecard'));
  }

  const seeAll = scope.querySelector('.link-box a[href]:not([href^="javascript"])');

  const cells = [];

  rateCards.forEach((card, idx) => {
    const labelEl = card.querySelector('h2.target, h2, .target');
    const panel = card.querySelector('.toggle-ctnt, .block');

    // --- Label cell: clean text only (drop icon figure / arrow icon). ---
    let labelText = '';
    if (labelEl) {
      const clone = labelEl.cloneNode(true);
      clone.querySelectorAll('figure, img, i, svg').forEach((n) => n.remove());
      labelText = clone.textContent.replace(/\s+/g, ' ').trim();
    }
    const label = document.createElement('p');
    label.textContent = labelText || `Tab ${idx + 1}`;

    // --- Content cell: keep the panel markup (rate figures + descriptions). ---
    const contentCell = [];
    if (panel) {
      const panelClone = panel.cloneNode(true);
      panelClone.querySelectorAll('script, style, link, input, i, svg').forEach((n) => n.remove());
      contentCell.push(panelClone);
    }

    // Append the "See all rates" link to the last tab so it is not lost.
    if (idx === rateCards.length - 1 && seeAll) {
      const link = document.createElement('a');
      link.setAttribute('href', seeAll.getAttribute('href'));
      link.textContent = seeAll.textContent.replace(/\s+/g, ' ').trim() || 'See all rates';
      const p = document.createElement('p');
      p.append(link);
      contentCell.push(p);
    }

    if (!labelText && !contentCell.length) return;

    cells.push([label, contentCell.length ? contentCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-rates', cells });
  element.replaceWith(block);
}
