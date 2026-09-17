import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function textOf(div) {
  return div ? div.textContent.trim() : '';
}

function buildTextEl(div, className, tag = 'span') {
  const el = document.createElement(tag);
  el.className = className;
  if (div) {
    el.textContent = textOf(div);
    moveInstrumentation(div, el);
  }
  return el;
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const [
      imageDiv,
      tagDiv,
      categoryDiv,
      readingTimeDiv,
      publishedDateDiv,
      titleDiv,
      descriptionDiv,
      linkDiv,
      linkTextDiv,
      ctaStyleDiv,
      authorImageDiv,
      authorNameDiv,
      authorRoleDiv,
    ] = [...row.children];

    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'article-card-image';
    if (imageDiv) {
      moveInstrumentation(imageDiv, imageWrapper);
      while (imageDiv.firstElementChild) imageWrapper.append(imageDiv.firstElementChild);
    }

    const meta = document.createElement('div');
    meta.className = 'article-card-meta';
    meta.append(
      buildTextEl(tagDiv, 'article-card-tag'),
      buildTextEl(categoryDiv, 'article-card-category'),
      buildTextEl(readingTimeDiv, 'article-card-reading-time'),
    );

    const published = buildTextEl(publishedDateDiv, 'article-card-published', 'p');
    const title = buildTextEl(titleDiv, 'article-card-title', 'h2');

    const description = document.createElement('div');
    description.className = 'article-card-description';
    if (descriptionDiv) {
      moveInstrumentation(descriptionDiv, description);
      while (descriptionDiv.firstElementChild) description.append(descriptionDiv.firstElementChild);
    }

    const linkAnchor = linkDiv ? linkDiv.querySelector('a') : null;
    const linkHref = linkAnchor ? linkAnchor.getAttribute('href') : null;
    const linkLabel = textOf(linkTextDiv);
    if (linkHref && linkLabel) {
      const isButton = textOf(ctaStyleDiv).toLowerCase() === 'button';
      const ctaWrapper = document.createElement('p');
      ctaWrapper.className = 'button-container';
      const cta = document.createElement('a');
      cta.className = isButton ? 'button primary' : 'button';
      cta.href = linkHref;
      cta.textContent = linkLabel;
      moveInstrumentation(linkTextDiv, cta);
      ctaWrapper.append(cta);
      description.append(ctaWrapper);
    }

    const authorImage = document.createElement('div');
    authorImage.className = 'article-card-author-image';
    if (authorImageDiv) {
      moveInstrumentation(authorImageDiv, authorImage);
      while (authorImageDiv.firstElementChild) authorImage.append(authorImageDiv.firstElementChild);
    }

    const authorInfo = document.createElement('div');
    authorInfo.className = 'article-card-author-info';
    authorInfo.append(
      buildTextEl(authorNameDiv, 'article-card-author-name', 'p'),
      buildTextEl(authorRoleDiv, 'article-card-author-role', 'p'),
    );

    const author = document.createElement('div');
    author.className = 'article-card-author';
    author.append(authorImage, authorInfo);

    const body = document.createElement('div');
    body.className = 'article-card-body';
    body.append(meta, published, title, description, author);

    li.append(imageWrapper, body);
    ul.append(li);
  });

  ul.querySelectorAll('.article-card-image picture > img').forEach((img) => {
    const optimizedPicture = createOptimizedPicture(img.src, img.alt, false, [{ width: '1200' }]);
    moveInstrumentation(img, optimizedPicture.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPicture);
  });

  ul.querySelectorAll('.article-card-author-image picture > img').forEach((img) => {
    const optimizedPicture = createOptimizedPicture(img.src, img.alt, false, [{ width: '96' }]);
    moveInstrumentation(img, optimizedPicture.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPicture);
  });

  block.replaceChildren(ul);
}
