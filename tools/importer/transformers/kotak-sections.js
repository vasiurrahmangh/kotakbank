/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Kotak Mahindra Bank section breaks.
 *
 * Inserts a horizontal rule (<hr>) before each section (except the first) so the
 * importer renders distinct EDS sections. Section boundaries come from
 * payload.template.sections (page-templates.json, template "home"), which has
 * 10 sections -> 9 expected <hr> section breaks.
 *
 * All 10 section.selector values were validated against migration-work/cleaned.html:
 *   section-1: .heroslider.section
 *   section-2..section-10: .white-background > div:nth-child(1..9)
 *     (section-4 is expressed as .white-background > div.thincarousalbanner.section,
 *      which is the same element as .white-background > div:nth-child(3))
 * They resolve to 10 distinct elements in document order.
 *
 * Every section has style: null, so NO Section Metadata blocks are created.
 *
 * Runs in afterTransform only (section breaks are final-structure cleanup).
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const sections =
      payload && payload.template && Array.isArray(payload.template.sections)
        ? payload.template.sections
        : [];

    if (sections.length < 2) return;

    const doc = element.ownerDocument;

    // Block parsers run BEFORE this hook and replace each source section element
    // (e.g. `.white-background > div:nth-child(N)`) with a block table whose class
    // is the variant name (`.cards-product`, `.carousel-banner`, etc.). The
    // original section.selector values therefore no longer match. Instead, insert
    // a section break (<hr>) between each top-level block table so EDS renders
    // distinct sections. The block tables are the direct children of the content
    // root that carry a known variant class.
    const VARIANT_CLASSES = [
      'carousel-hero', 'carousel-banner', 'cards-product',
      'cards-help', 'columns-media', 'tabs-rates',
    ];

    // Collect the block tables in document order anywhere under the content root.
    const blockTables = Array.from(
      element.querySelectorAll(VARIANT_CLASSES.map((c) => `.${c}`).join(',')),
    );

    if (blockTables.length < 2) return;

    // Insert an <hr> before every block table except the first, but only when the
    // immediately preceding sibling isn't already an <hr>. EDS converts a top-level
    // <hr> into a section boundary.
    for (let i = blockTables.length - 1; i >= 1; i -= 1) {
      const target = blockTables[i];
      const prev = target.previousElementSibling;
      if (prev && prev.tagName === 'HR') continue;
      const hr = doc.createElement('hr');
      target.parentNode.insertBefore(hr, target);
    }
  }
}
