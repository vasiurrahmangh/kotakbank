/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Kotak (legacy AEM) site-wide cleanup.
 *
 * All selectors below were verified against migration-work/cleaned.html for
 * https://www.kotak.bank.in/en/home.html. Nothing here is guessed.
 *
 * Page shell layout discovered in captured DOM (body > div counted by nth-of-type):
 *   div(1)  -> notification widget wrapper (#modal-widget-*, #notification_widget) + clientlib <link>
 *   header.header-container.search-results-cont          -> global site header / nav
 *   div(2)  -> #search-modal (.search-modal-popup.modal.fade)
 *   div(3)  -> .mobile-header-container
 *   div(4)  -> .headerfooter-container (mobile bottom tab bar chrome)
 *   div(5)  -> .heroslider.section            (AUTHORABLE: hero carousel)
 *   div(6)  -> empty .iparys_inherited placeholder
 *   div(7)  -> main authorable content (cards, banner carousel, video, etc.)
 *   div(8)  -> empty .iparys_inherited placeholder
 *   footer.footer                              -> global site footer
 *   div(9)  -> #fade loader overlay
 *   iframe x3                                  -> doubleclick / tracking pixels
 *
 * EDS auto-populates header and footer, so all global chrome is removed and only
 * the authorable hero + main content survives.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / modals that interfere with block parsing.
    // Verified in DOM: <div id="search-modal" class="search-modal-popup modal fade">,
    // <div class="modal" id="audioPopupShow"> (6 instances inside carousels),
    // <div id="fade"> loader overlay near end of body.
    WebImporter.DOMUtils.remove(element, [
      '#search-modal',
      '#audioPopupShow',
      '.modal.fade',
      '#fade',
    ]);

    // Owl carousel injects duplicate "cloned" slides at runtime (8 in captured DOM:
    // inside .heroslider and .thincarousalbanner). Removing them before parsing keeps
    // carousel parsers from extracting duplicate slides.
    element.querySelectorAll('.owl-item.cloned').forEach((el) => el.remove());

    // Hidden form inputs / personalization triggers that are not authorable content.
    // Verified: <input id="unica-icon">, <input id="search-...">, 14 <input> total.
    element.querySelectorAll('input').forEach((el) => el.remove());

    // Promote lazy-loaded images to a real `src` BEFORE anything else processes
    // the DOM. Many images on this site (especially personalized product cards)
    // ship with an empty/placeholder `src` and the real URL only in
    // data-srcset / data-originalsrc / data-src. The importer's built-in image
    // preprocessing removes placeholder/base64 <img> elements, which would
    // delete these before block parsers can read them. Setting a concrete src
    // here keeps the image nodes alive and resolvable downstream.
    // AEM static-rendition URLs (".jpg.transform/.../image.jpg") are normalized
    // to their base asset URL, which the importer downloads reliably.
    const LAZY_SRC_ATTRS = ['data-originalsrc', 'data-src', 'data-original', 'data-lazy-src'];
    const normalizeRendition = (u) => (u ? u.replace(/\.transform\/[^?#]*/i, '') : u);
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const hasRealSrc = src.trim() !== '' && !src.startsWith('data:');
      if (hasRealSrc) {
        img.setAttribute('src', normalizeRendition(src));
        return;
      }
      let resolved = '';
      LAZY_SRC_ATTRS.some((attr) => {
        const v = img.getAttribute(attr);
        if (v && v.trim() !== '' && !v.trim().startsWith('data:')) { resolved = v.trim(); return true; }
        return false;
      });
      if (!resolved) {
        const srcset = img.getAttribute('data-srcset') || img.getAttribute('srcset') || '';
        if (srcset) resolved = srcset.split(',')[0].trim().split(/\s+/)[0];
      }
      if (resolved) img.setAttribute('src', normalizeRendition(resolved));
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome — EDS supplies header/footer/nav.
    // Selectors verified in captured DOM.
    WebImporter.DOMUtils.remove(element, [
      // Notification / maintenance widget at top of body.
      '[id^="modal-widget-"]',
      '#notification_widget',
      '.notificationWidgetId',
      // Global site header / navigation.
      'header.header-container',
      '.mobile-header-container',
      // Mobile bottom tab bar ("Home / Learn / Help / Get App").
      '.headerfooter-container',
      // Global site footer.
      'footer.footer',
      // Loader overlay.
      '#fade',
      // DMP / ad slot placeholders (e.g. <div id="bp_6088_DmpSlotId134">).
      '[id^="bp_"][id*="DmpSlotId"]',
      // Non-content scaffolding / scripts / tracking.
      'link',
      'style',
      'script',
      'noscript',
      'iframe',
      'audio',
    ]);

    // Strip AEM HTL (Sightly) authoring leftovers and tracking attributes that
    // survived in the captured DOM. Verified attribute names present in cleaned.html.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-sly-test');
      el.removeAttribute('data-sly-list');
      el.removeAttribute('data-hem-burager');
      el.removeAttribute('data-ic-target');
      el.removeAttribute('data-mb-lilevel');
      el.removeAttribute('data-size');
    });

    // Remove empty image placeholders (e.g. <img src="" ...>) and inline base64
    // svg arrow glyphs that produce no meaningful content in markdown.
    // IMPORTANT: many real images on this site are lazy-loaded with an empty
    // src and the actual URL held in data-srcset / data-originalsrc / data-src.
    // Those must be preserved so block parsers can resolve them — only remove
    // images that have no usable lazy-load attribute either.
    const LAZY_ATTRS = ['data-srcset', 'data-originalsrc', 'data-src', 'data-original', 'data-lazy-src', 'srcset'];
    const hasLazyUrl = (img) => LAZY_ATTRS.some((attr) => {
      const v = img.getAttribute(attr);
      return v && v.trim() !== '' && !v.trim().startsWith('data:');
    });
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const isEmpty = src.trim() === '';
      const isInlineSvg = src.startsWith('data:image/svg+xml');
      if ((isEmpty || isInlineSvg) && !hasLazyUrl(img)) {
        img.remove();
      }
    });
  }
}
