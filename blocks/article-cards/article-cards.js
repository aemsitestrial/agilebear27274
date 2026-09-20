import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cell order MUST match the field order in _article-cards.json.
 * image + imageAlt collapse into one cell, link + linkText collapse into one cell.
 */
const FIELDS = [
  'image',
  'tag',
  'category',
  'readTime',
  'published',
  'text',
  'link',
  'avatar',
  'authorName',
  'authorRole',
];

function isEmpty(cell) {
  return !cell || (!cell.textContent.trim() && !cell.querySelector('picture, img, a'));
}

function wrap(className, ...children) {
  const el = document.createElement('div');
  el.className = className;
  children.filter((child) => !isEmpty(child)).forEach((child) => el.append(child));
  return el;
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = {};
    FIELDS.forEach((name, i) => {
      const cell = row.children[i];
      if (cell) cell.className = `article-cards-${name}`;
      cells[name] = cell;
    });

    const li = document.createElement('li');
    moveInstrumentation(row, li);

    // No image authored = featured (grey, text-only) card with a button CTA
    const hasImage = !isEmpty(cells.image) && cells.image.querySelector('picture, img');
    if (!hasImage) li.classList.add('is-featured');

    // Normalise the CTA: drop the global button styling, use block styles instead
    const cta = cells.link?.querySelector('a');
    if (cta) {
      cta.className = 'article-cards-cta';
      cta.parentElement?.classList.remove('button-container');
    }

    const meta = wrap('article-cards-meta', cells.tag, cells.category, cells.readTime);
    const body = wrap('article-cards-content', meta, cells.published, cells.text, cells.link);
    const info = wrap('article-cards-author-info', cells.authorName, cells.authorRole);
    const author = wrap('article-cards-author', cells.avatar, info);

    if (hasImage) li.append(cells.image);
    li.append(body);
    if (author.children.length) li.append(author);

    ul.append(li);
  });

  // Optimise images, keeping Universal Editor instrumentation on the new <img>
  ul.querySelectorAll('picture > img').forEach((img) => {
    const isAvatar = img.closest('.article-cards-avatar');
    const width = isAvatar ? '96' : '750';
    const pic = createOptimizedPicture(img.src, isAvatar ? '' : img.alt, false, [{ width }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });

  block.replaceChildren(ul);
}
