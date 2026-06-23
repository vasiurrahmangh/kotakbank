/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Kotak section breaks + section metadata.
 *
 * Driven entirely by payload.template.sections from page-templates.json.
 * Runs in afterTransform only (block parsers have already produced block tables;
 * we now insert section boundaries between them).
 *
 * For each section (processed in reverse so earlier inserts don't shift later
 * selector matches):
 *   - If section.style is set, append a "Section Metadata" block after the
 *     section's first element.
 *   - For every non-first section, insert an <hr> before the section's first
 *     element to create the section break.
 *
 * The "home" template defines 10 sections, all with style === null, so this
 * produces 9 <hr> breaks and 0 Section Metadata blocks.
 *
 * Section selectors are sourced from page-templates.json (which were derived
 * from the captured DOM of https://www.kotak.bank.in/en/home.html).
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) {
      return;
    }

    const doc = element.ownerDocument;

    // Resolve the first DOM element for a section from its selector.
    const resolveSectionEl = (section) => {
      if (!section || !section.selector) return null;
      // Selectors are absolute (body > ...). Try document first, then scope to element.
      let el = null;
      try {
        el = doc.querySelector(section.selector);
      } catch (e) {
        el = null;
      }
      if (el) return el;

      // Fallback: the page-templates selectors use `tag.classA.classB:nth-of-type(N)`
      // but the captured DOM mixes several block types as siblings, so CSS
      // :nth-of-type (which counts ALL tags of that type) does not match the
      // intended "Nth element of that class". Reinterpret the trailing token with
      // nth-of-CLASS semantics, scoped to the nearest resolvable ancestor.
      const parts = section.selector.split('>').map((p) => p.trim()).filter(Boolean);
      const last = parts[parts.length - 1];
      if (!last) return null;

      // Parse trailing token: tag, classes, optional :nth-of-type(N).
      const nthMatch = last.match(/:nth-of-type\((\d+)\)\s*$/);
      const nth = nthMatch ? parseInt(nthMatch[1], 10) : null;
      const base = last.replace(/:nth-of-type\(\d+\)\s*$/, '').trim();

      // Resolve a scope element from the selector prefix (everything before the
      // trailing token). Try progressively shorter prefixes until one matches.
      let scope = element;
      for (let p = parts.length - 1; p >= 1; p -= 1) {
        const prefix = parts.slice(0, p).join(' > ');
        try {
          const found = doc.querySelector(prefix) || element.querySelector(prefix.replace(/^body\s*>?\s*/, ''));
          if (found) {
            scope = found;
            break;
          }
        } catch (e) {
          // keep trying shorter prefixes
        }
      }

      // Collect direct children of scope that match the base (tag.classes) and
      // pick the Nth (1-based), or the first when no nth was specified.
      let candidates = [];
      try {
        candidates = Array.from(scope.children).filter((c) => c.matches(base));
      } catch (e) {
        candidates = [];
      }
      if (candidates.length === 0) {
        // Last resort: any descendant matching the base within scope.
        try {
          candidates = Array.from(scope.querySelectorAll(base));
        } catch (e) {
          candidates = [];
        }
      }
      if (candidates.length === 0) return null;
      const idx = nth ? nth - 1 : 0;
      return candidates[idx] || null;
    };

    // Process in reverse so inserting nodes does not invalidate earlier matches.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = resolveSectionEl(section);
      if (!sectionEl) {
        // Selector did not match on this page; skip without breaking others.
        continue;
      }

      // Section Metadata block (only when a style is defined).
      if (section.style) {
        const meta = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.parentNode.insertBefore(meta, sectionEl.nextSibling);
      }

      // Section break before every non-first section.
      if (i > 0) {
        const hr = doc.createElement('hr');
        sectionEl.parentNode.insertBefore(hr, sectionEl);
      }
    }
  }
}
