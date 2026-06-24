export default function decorate(block) {
  const rows = [...block.children];
  const cols = rows[0] ? [...rows[0].children] : [];
  block.classList.add(`columns-media-${cols.length}-cols`);

  rows.forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      const headings = col.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const links = col.querySelectorAll('p > a');

      if (pic && headings.length) {
        // Featured media card: image with title/label/cta overlaid in a gradient band
        col.classList.add('columns-media-feature');
        const picWrapper = pic.closest('p') || pic.parentElement;
        if (picWrapper) picWrapper.classList.add('columns-media-feature-media');

        // group every element that is not the picture wrapper into an overlay
        const overlay = document.createElement('div');
        overlay.className = 'columns-media-overlay';
        [...col.children].forEach((child) => {
          if (child !== picWrapper && child !== overlay) overlay.append(child);
        });
        col.append(overlay);
      } else if (pic && col.children.length === 1) {
        // Standalone media (e.g. video poster): add play affordance
        const picWrapper = pic.closest('div') || col;
        picWrapper.classList.add('columns-media-img-col');
        col.classList.add('columns-media-video');
        const play = document.createElement('span');
        play.className = 'columns-media-play';
        play.setAttribute('aria-hidden', 'true');
        picWrapper.append(play);
      } else if (links.length > 1) {
        // Link list column (stories in focus)
        col.classList.add('columns-media-list');
      } else {
        col.classList.add('columns-media-text');
      }
    });
  });
}
