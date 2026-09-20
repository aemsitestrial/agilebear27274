import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * The block model has ONE composite multifield ("items"), so the block is a single
 * cell holding a flat list of elements, one card after another, separated by <hr>.
 * Field order inside a card (see _article-cards.json):
 *   image | tag | category | readTime | published | title | description
 *   | link (button) | authorImage | authorName | authorRole
 * Empty fields are skipped by position rules below, so authors should fill all text fields.
 */

const hasPicture = (el) => el.matches('picture') || Boolean(el.querySelector('picture'));
const hasLink = (el) => el.matches('a') || Boolean(el.querySelector('a'));
const hasText = (el) => Boolean(el && el.textContent.trim());

function div(className, ...children) {
  const el = document.createElement('div');
  el.className = className;
  children.filter(Boolean).forEach((child) => el.append(child));
  return el;
}

/** Returns one { wrapper, els } per card. */
function getCards(block) {
  // Universal Editor markup: each composite item can be wrapped in [data-aue-model]
  const wrappers = [...block.querySelectorAll('[data-aue-model]')];
  if (wrappers.length) return wrappers.map((wrapper) => ({ wrapper, els: [...wrapper.children] }));

  // Delivered markup: flat list separated by <hr>
  const cards = [];
  let current = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    [...cell.children].forEach((child) => {
      if (child.tagName === 'HR') {
        if (current.length) cards.push({ wrapper: null, els: current });
        current = [];
      } else {
        current.push(child);
      }
    });
  });
  if (current.length) cards.push({ wrapper: null, els: current });
  return cards;
}

function buildCard({ wrapper, els }) {
  const li = document.createElement('li');
  if (wrapper) moveInstrumentation(wrapper, li);

  const idx = (el) => els.indexOf(el);
  const pictures = els.filter(hasPicture);
  const link = els.find(hasLink);
  const image = els[0] && hasPicture(els[0]) ? els[0] : null;
  const avatar = pictures.find((el) => el !== image);
  const texts = els.filter((el) => !hasPicture(el) && el !== link && hasText(el));

  const contentEnd = Math.min(...[link, avatar].filter(Boolean).map(idx), els.length);
  let authorStart = els.length;
  if (avatar) authorStart = idx(avatar);
  else if (link) authorStart = idx(link);
  const body = texts.filter((el) => idx(el) < contentEnd);
  const [authorName, authorRole] = texts.filter((el) => idx(el) > authorStart);

  // body = [tag, category, readTime, published, title, description]; title + description are last
  const description = body.length > 1 ? body.pop() : null;
  const title = body.pop();
  const [tag, category, readTime, published] = body;

  // No image authored = featured (grey, text-only) card with a button CTA
  if (image) li.append(div('article-cards-image', image));
  else li.classList.add('is-featured');

  const meta = div('article-cards-meta');
  Object.entries({ tag, category, readTime }).forEach(([name, el]) => {
    if (el) {
      el.className = `article-cards-${name}`;
      meta.append(el);
    }
  });
  if (published) published.className = 'article-cards-published';

  const text = div('article-cards-text');
  if (title) {
    const heading = document.createElement('h3');
    moveInstrumentation(title, heading);
    heading.append(...title.childNodes);
    text.append(heading);
  }
  if (description) text.append(description);

  let ctaEl = null;
  const cta = link?.matches('a') ? link : link?.querySelector('a');
  if (cta) {
    cta.className = 'article-cards-cta';
    ctaEl = cta.closest('p') || cta;
    ctaEl.classList.remove('button-container');
  }

  li.append(div('article-cards-content', meta, published, text, ctaEl && div('article-cards-link', ctaEl)));

  if (authorName) authorName.className = 'article-cards-authorName';
  if (authorRole) authorRole.className = 'article-cards-authorRole';
  if (avatar || authorName) {
    li.append(div(
      'article-cards-author',
      avatar && div('article-cards-avatar', avatar),
      div('article-cards-author-info', authorName, authorRole),
    ));
  }

  return li;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  getCards(block).forEach((card) => ul.append(buildCard(card)));

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
