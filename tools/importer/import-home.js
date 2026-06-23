/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import carouselBannerParser from './parsers/carousel-banner.js';
import cardsProductParser from './parsers/cards-product.js';
import cardsHelpParser from './parsers/cards-help.js';
import columnsMediaParser from './parsers/columns-media.js';
import tabsRatesParser from './parsers/tabs-rates.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/kotak-cleanup.js';
import sectionsTransformer from './transformers/kotak-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'carousel-banner': carouselBannerParser,
  'cards-product': cardsProductParser,
  'cards-help': cardsHelpParser,
  'columns-media': columnsMediaParser,
  'tabs-rates': tabsRatesParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Kotak Mahindra Bank home page: hero carousel, product card grid, helpline banner carousel, video/Hausla section, Knowledge Hub, Need Help cards, app/promo cards, Rates & Charges, footer link lists',
  urls: [
    'https://www.kotak.bank.in/en/home.html',
  ],
  blocks: [
    {
      name: 'carousel-hero',
      instances: ['.heroslider.section'],
    },
    {
      name: 'cards-product',
      instances: [
        '.white-background > div:nth-child(1)',
        '.white-background > div:nth-child(2)',
        '.white-background > div:nth-child(8)',
        '.white-background > div:nth-child(9)',
      ],
    },
    {
      name: 'carousel-banner',
      instances: ['.white-background > div.thincarousalbanner.section'],
    },
    {
      name: 'columns-media',
      instances: [
        '.white-background > div:nth-child(4)',
        '.white-background > div:nth-child(6)',
      ],
    },
    {
      name: 'cards-help',
      instances: ['.white-background > div:nth-child(7)'],
    },
    {
      name: 'tabs-rates',
      instances: ['.white-background > div:nth-child(9) .ratecardwrapper.section'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero carousel',
      selector: '.heroslider.section',
      style: null,
      blocks: ['carousel-hero'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Product card grid (row 1)',
      selector: '.white-background > div:nth-child(1)',
      style: null,
      blocks: ['cards-product'],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'Product card grid (row 2)',
      selector: '.white-background > div:nth-child(2)',
      style: null,
      blocks: ['cards-product'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Helpline banner carousel',
      selector: '.white-background > div.thincarousalbanner.section',
      style: null,
      blocks: ['carousel-banner'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Video + Hausla text',
      selector: '.white-background > div:nth-child(4)',
      style: null,
      blocks: ['columns-media'],
      defaultContent: [],
    },
    {
      id: 'section-6',
      name: 'Knowledge Hub heading',
      selector: '.white-background > div:nth-child(5)',
      style: null,
      blocks: [],
      defaultContent: ['.white-background > div:nth-child(5)'],
    },
    {
      id: 'section-7',
      name: 'Knowledge Hub content',
      selector: '.white-background > div:nth-child(6)',
      style: null,
      blocks: ['columns-media'],
      defaultContent: [],
    },
    {
      id: 'section-8',
      name: 'Need Help',
      selector: '.white-background > div:nth-child(7)',
      style: null,
      blocks: ['cards-help'],
      defaultContent: [],
    },
    {
      id: 'section-9',
      name: 'App/promo cards (row 1)',
      selector: '.white-background > div:nth-child(8)',
      style: null,
      blocks: ['cards-product'],
      defaultContent: [],
    },
    {
      id: 'section-10',
      name: 'App/promo cards (row 2) + Rates & Charges',
      selector: '.white-background > div:nth-child(9)',
      style: null,
      blocks: ['cards-product', 'tabs-rates'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

/**
 * Promote lazy-loaded images/sources to a concrete URL.
 * Kotak ships feature-card and promo images via a client-side lazyload library
 * (class "lazyload", URL in data-srcset / data-originalsrc / data-src) that only
 * fires on scroll — which does not complete during headless import capture. This
 * copies the real URL into src/srcset so the images survive cleanup and parsing.
 * AEM static-rendition URLs (".jpg.transform/.../image.jpg") are normalized to
 * their base asset URL, which the importer downloads reliably.
 */
function forceLazyImages(root) {
  const normalize = (u) => (u ? u.replace(/\.transform\/[^?#]*/i, '') : u);
  const firstUrl = (srcset) => (srcset ? normalize(srcset.split(',')[0].trim().split(/\s+/)[0]) : '');

  root.querySelectorAll('source').forEach((source) => {
    const ss = source.getAttribute('srcset') || '';
    const dss = source.getAttribute('data-srcset') || '';
    if ((!ss || ss.trim() === '') && dss) source.setAttribute('srcset', firstUrl(dss));
    else if (ss) source.setAttribute('srcset', firstUrl(ss));
  });

  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    const hasRealSrc = src.trim() !== '' && !src.startsWith('data:');
    if (hasRealSrc) { img.setAttribute('src', normalize(src)); return; }
    let resolved = '';
    ['data-originalsrc', 'data-src', 'data-original', 'data-lazy-src'].some((attr) => {
      const v = img.getAttribute(attr);
      if (v && v.trim() !== '' && !v.trim().startsWith('data:')) { resolved = v.trim(); return true; }
      return false;
    });
    if (!resolved) resolved = firstUrl(img.getAttribute('data-srcset') || img.getAttribute('srcset') || '');
    if (resolved) img.setAttribute('src', normalize(resolved));
  });
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // Trigger the source site's lazy-load: force every lazy <img>/<source> to
    // adopt its real URL from data-srcset/data-originalsrc/data-src. The page
    // loads feature-card and promo images client-side on scroll, which does not
    // complete during headless capture, so without this the images would be
    // dropped (empty src). Runs first, before any cleanup or parsing.
    forceLazyImages(main);

    // 1. beforeTransform (initial cleanup, strip cloned carousel slides, modals)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers.
    //    tabs-rates lives inside the same div:nth-child(9) as a cards-product
    //    instance, so order matters: parse cards-product instances first, then
    //    tabs-rates locates and replaces the rate card wrapper within it.
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by an earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (remove header/footer/chrome + add section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
