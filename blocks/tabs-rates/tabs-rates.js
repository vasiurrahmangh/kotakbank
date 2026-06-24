import { toClassName } from '../../scripts/aem.js';

/**
 * Decorates the tabs-rates block as a "Rates & Charges" accordion card.
 * Authored structure: each direct child row = [label cell, content cell].
 * Output: a header bar + accordion rows (label toggles its panel).
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // remove any trailing loader/empty rows (rows without a label + content pair)
  const rows = [...block.children].filter((row) => row.children.length >= 2);

  // header bar
  const header = document.createElement('div');
  header.className = 'tabs-rates-header';
  header.textContent = 'Rates & Charges';

  // accordion container
  const list = document.createElement('div');
  list.className = 'tabs-rates-accordion';
  list.setAttribute('role', 'tablist');

  rows.forEach((row, i) => {
    const labelCell = row.children[0];
    const contentCell = row.children[1];
    const id = toClassName(labelCell.textContent);

    // tab button (category label + chevron)
    const button = document.createElement('button');
    button.className = 'tabs-rates-tab';
    button.id = `tab-${id}`;
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', i === 0);

    const label = document.createElement('span');
    label.className = 'tabs-rates-label';
    label.textContent = labelCell.textContent.trim();

    const chevron = document.createElement('span');
    chevron.className = 'tabs-rates-chevron';
    chevron.setAttribute('aria-hidden', 'true');

    button.append(label, chevron);

    // panel
    const panel = document.createElement('div');
    panel.className = 'tabs-rates-panel';
    panel.id = `tabpanel-${id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    panel.setAttribute('aria-hidden', i !== 0);
    while (contentCell.firstChild) panel.append(contentCell.firstChild);

    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-selected') === 'true';
      list.querySelectorAll('[role=tab]').forEach((b) => b.setAttribute('aria-selected', false));
      list.querySelectorAll('[role=tabpanel]').forEach((p) => p.setAttribute('aria-hidden', true));
      if (!isOpen) {
        button.setAttribute('aria-selected', true);
        panel.setAttribute('aria-hidden', false);
      }
    });

    list.append(button, panel);
    row.remove();
  });

  // "See all rates" link is authored inside the last panel; promote it to a footer link box
  const seeAll = list.querySelector('.tabs-rates-panel p:last-child > a:only-child');
  if (seeAll && /see all/i.test(seeAll.textContent)) {
    const seeAllBox = document.createElement('div');
    seeAllBox.className = 'tabs-rates-seeall';
    seeAllBox.append(seeAll.closest('p'));
    block.textContent = '';
    block.append(header, list, seeAllBox);
    return;
  }

  block.textContent = '';
  block.append(header, list);
}
