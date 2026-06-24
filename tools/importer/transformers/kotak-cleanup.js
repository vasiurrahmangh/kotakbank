/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Kotak Mahindra Bank site-wide cleanup.
 *
 * All selectors below were validated against migration-work/cleaned.html for the
 * Kotak home page. The importer runs against the LIVE URL, where this site
 * lazy-loads images: many real <img> elements ship with an empty/placeholder
 * `src` and the real URL only in `data-originalsrc` / `data-src` / `data-srcset`.
 * The first thing beforeTransform does is PROMOTE those lazy images to a concrete
 * `src` so the importer's image preprocessing does not delete product/promo card
 * images. (Confirmed critical fix from a prior build of this exact page.)
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Treat as a placeholder/empty src if missing, blank, a data: URI, a 1x1/blank
// gif, or a known lazy-load placeholder.
function isPlaceholderSrc(src) {
  if (!src) return true;
  const s = src.trim();
  if (s === '') return true;
  if (s.startsWith('data:')) return true;
  if (/(blank|placeholder|spacer|1x1|transparent)\.(gif|png|svg)(\?|$)/i.test(s)) return true;
  return false;
}

// Pick the first real URL out of a srcset value ("url 360w, url2 720w" -> url).
function firstFromSrcset(srcset) {
  if (!srcset) return '';
  const first = srcset.split(',')[0];
  if (!first) return '';
  return first.trim().split(/\s+/)[0] || '';
}

// Normalize AEM static-rendition URLs:
//   .../image.jpg.transform/transformer-width-360-height-202/image.jpg -> .../image.jpg
// so the importer fetches the original (full-resolution) asset instead of a
// fixed crop. Handles jpg/jpeg/png/webp/gif/svg base extensions.
function normalizeRenditionUrl(url) {
  if (!url) return url;
  const m = url.match(/^(.*\.(?:jpe?g|png|webp|gif|svg))\.transform\/[^?#]*$/i);
  return m ? m[1] : url;
}

// Promote every lazy <img> to a concrete, normalized src BEFORE any other
// cleanup. Only remove an <img> that has neither a usable src nor any usable
// lazy attribute.
function promoteLazyImages(element) {
  element.querySelectorAll('img').forEach((img) => {
    const currentSrc = img.getAttribute('src');
    let resolved = '';

    if (!isPlaceholderSrc(currentSrc)) {
      resolved = currentSrc;
    } else {
      resolved =
        img.getAttribute('data-originalsrc') ||
        img.getAttribute('data-src') ||
        firstFromSrcset(img.getAttribute('data-srcset')) ||
        firstFromSrcset(img.getAttribute('srcset')) ||
        '';
    }

    resolved = normalizeRenditionUrl((resolved || '').trim());

    if (resolved) {
      img.setAttribute('src', resolved);
      // Drop now-redundant lazy attributes so preprocessing doesn't re-read them.
      img.removeAttribute('data-originalsrc');
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
    } else if (isPlaceholderSrc(currentSrc)) {
      // No usable src and no usable lazy attribute -> safe to remove.
      img.remove();
    }
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // 1) PROMOTE LAZY IMAGES FIRST — before anything that could strip them.
    promoteLazyImages(element);

    // 2) Remove modal / audio / popup overlays that duplicate or block parsing.
    //    Validated in cleaned.html:
    //      <div class="search-modal-popup modal fade"> , .modal.* success/get-help
    //      <audio id="my_audio_hero"> (hero carousel audio)
    WebImporter.DOMUtils.remove(element, [
      '.search-modal-popup',
      '.success-modal',
      '.get-help-popup',
      'audio',
      '#my_audio_hero',
    ]);

    // 3) Remove notification / personalization widget chrome.
    //    Validated: #notification_widget, [id^="modal-widget-"], #unica-icon,
    //    .notificationWidgetId, .unica-personlization-widget-cta
    WebImporter.DOMUtils.remove(element, [
      '#notification_widget',
      '[id^="modal-widget-"]',
      '#unica-icon',
      '.notificationWidgetId',
      '.unica-personlization-widget-cta',
    ]);

    // 4) Remove DMP ad slots (non-authorable injected ad targets).
    //    Validated: id="bp_6088_DmpSlotId134"
    WebImporter.DOMUtils.remove(element, ['[id*="DmpSlotId"]']);

    // 5) Remove owl-carousel duplicated/cloned slides so block parsers see each
    //    real slide exactly once. Validated: .owl-item.cloned present (owl clones
    //    leading/trailing slides for infinite loop). Keep the originals.
    element.querySelectorAll('.owl-item.cloned').forEach((el) => el.remove());
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site shell/chrome. Mapped from the live import DOM:
    //   <header class="header-container ...">  -> desktop mega-menu nav
    //   <div class="mobile-header-container">  -> mobile menu nav
    //   <div class="headerfooter-container">   -> mobile bottom tab bar
    //   <footer class="footer">                -> site footer + disclaimers
    //   notification widget + disclaimer modal overlays
    //   AEM clientlib <link>/<style>/<script>, <noscript>, <iframe>
    // Removal-based (not isolation): the importer's captured DOM is sometimes
    // under-rendered (hero/body lazy content incomplete), so we must never
    // discard-by-reconstruction — only strip known chrome.
    WebImporter.DOMUtils.remove(element, [
      'header',
      '.header-container',
      '.mobile-header-container',
      '.headerfooter-container',
      'nav',
      'footer',
      '.footer',
      '#notification_widget',
      '[id^="modal-widget-"]',
      '.notificationWidgetId',
      '.success-modal',
      '.get-help-popup',
      '.modal.fade',
      '#fade',
      '[id*="DmpSlotId"]',
      'link',
      'style',
      'script',
      'noscript',
      'iframe',
      'input[type="hidden"]',
    ]);

    // Safety net: remove any stray top-level mega-menu lists that survived (bare
    // <ul> nav not wrapped in <header> in some captures). A nav <ul> is identified
    // by its menu classes.
    element.querySelectorAll(
      'ul.header-menu-ul, ul.mb-menu-ul, .header-menu, .mb-menu, .sec-footer-list-box',
    ).forEach((el) => el.remove());

    // Strip tracking / authoring scaffolding attributes from all remaining nodes.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-sly-test');
      el.removeAttribute('data-sly-list');
      el.removeAttribute('data-sly-use');
      el.removeAttribute('data-mb-lilevel');
      el.removeAttribute('data-ic-target');
      el.removeAttribute('data-hem-burager');
      el.removeAttribute('onclick');
    });
  }
}
