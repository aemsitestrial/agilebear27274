import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function textOf(div) {
  return div ? div.textContent.trim() : '';
}

function buildTextEl(div, className, tag = 'span') {
  if (!div || !textOf(div)) return null;

  const el = document.createElement(tag);
  el.className = className;
  el.textContent = textOf(div);

  moveInstrumentation(div, el);

  return el;
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row, index) => {
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

    // Optional featured card
    if (index === 1) {
      li.classList.add('article-card-featured');
    }

    moveInstrumentation(row, li);

    /* IMAGE */

    if (imageDiv) {
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'article-card-image';

      moveInstrumentation(imageDiv, imageWrapper);

      while (imageDiv.firstElementChild) {
        imageWrapper.append(imageDiv.firstElementChild);
      }

      li.append(imageWrapper);
    }

    /* BODY */

    const body = document.createElement('div');
    body.className = 'article-card-body';

    /* META */

    const meta = document.createElement('div');
    meta.className = 'article-card-meta';

    [
      buildTextEl(tagDiv, 'article-card-tag'),
      buildTextEl(categoryDiv, 'article-card-category'),
      buildTextEl(readingTimeDiv, 'article-card-reading-time'),
    ]
      .filter(Boolean)
      .forEach((el) => meta.append(el));

    if (meta.children.length) {
      body.append(meta);
    }

    /* DATE */

    const published = buildTextEl(
      publishedDateDiv,
      'article-card-published',
      'p',
    );

    if (published) body.append(published);

    /* TITLE */

    const title = buildTextEl(
      titleDiv,
      'article-card-title',
      'h2',
    );

    if (title) body.append(title);

    /* DESCRIPTION */

    if (descriptionDiv) {
      const description = document.createElement('div');
      description.className = 'article-card-description';

      moveInstrumentation(descriptionDiv, description);

      while (descriptionDiv.firstElementChild) {
        description.append(descriptionDiv.firstElementChild);
      }

      body.append(description);
    }

    /* CTA */

    const linkAnchor = linkDiv?.querySelector('a');
    const linkHref = linkAnchor?.href;
    const linkLabel = textOf(linkTextDiv);

    if (linkHref && linkLabel) {
      const ctaWrapper = document.createElement('div');
      ctaWrapper.className = 'article-card-cta';

      const cta = document.createElement('a');

      const isButton = textOf(ctaStyleDiv).toLowerCase() === 'button';

      cta.className = isButton
        ? 'button primary'
        : 'article-card-link';

      cta.href = linkHref;
      cta.textContent = linkLabel;

      ctaWrapper.append(cta);
      body.append(ctaWrapper);
    }

    /* AUTHOR */

    const author = document.createElement('div');
    author.className = 'article-card-author';

    if (authorImageDiv) {
      const authorImage = document.createElement('div');
      authorImage.className = 'article-card-author-image';

      moveInstrumentation(authorImageDiv, authorImage);

      while (authorImageDiv.firstElementChild) {
        authorImage.append(authorImageDiv.firstElementChild);
      }

      author.append(authorImage);
    }

    const authorInfo = document.createElement('div');
    authorInfo.className = 'article-card-author-info';

    const authorName = buildTextEl(
      authorNameDiv,
      'article-card-author-name',
      'p',
    );

    const authorRole = buildTextEl(
      authorRoleDiv,
      'article-card-author-role',
      'p',
    );

    if (authorName) authorInfo.append(authorName);
    if (authorRole) authorInfo.append(authorRole);

    if (authorInfo.children.length) {
      author.append(authorInfo);
    }

    if (author.children.length) {
      body.append(author);
    }

    li.append(body);
    ul.append(li);
  });

  ul.querySelectorAll('.article-card-image picture > img')
    .forEach((img) => {
      const optimizedPicture = createOptimizedPicture(
        img.src,
        img.alt,
        false,
        [{ width: '1200' }],
      );

      moveInstrumentation(
        img,
        optimizedPicture.querySelector('img'),
      );

      img.closest('picture').replaceWith(
        optimizedPicture,
      );
    });

  ul.querySelectorAll('.article-card-author-image picture > img')
    .forEach((img) => {
      const optimizedPicture = createOptimizedPicture(
        img.src,
        img.alt,
        false,
        [{ width: '96' }],
      );

      moveInstrumentation(
        img,
        optimizedPicture.querySelector('img'),
      );

      img.closest('picture').replaceWith(
        optimizedPicture,
      );
    });

  block.replaceChildren(ul);
}
