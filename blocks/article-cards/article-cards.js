import { createOptimizedPicture } from '../../scripts/aem.js';

function text(cell) {
  return cell ? cell.textContent.trim() : '';
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row, index) => {
    const cells = [...row.children];

    const li = document.createElement('li');

    if (index === 1) {
      li.classList.add('article-card-featured');
    }

    const [
      image,
      tag,
      category,
      readingTime,
      publishedDate,
      title,
      description,
      link,
      linkText,
      ctaStyle,
      authorImage,
      authorName,
      authorRole,
    ] = cells;

    /* IMAGE */

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'article-card-image';

    const picture = image?.querySelector('picture');

    if (picture) {
      imageWrapper.append(
        createOptimizedPicture(
          picture.querySelector('img').src,
          picture.querySelector('img').alt,
          false,
          [{ width: '1200' }],
        ),
      );
    }

    /* BODY */

    const body = document.createElement('div');
    body.className = 'article-card-body';

    /* META */

    const meta = document.createElement('div');
    meta.className = 'article-card-meta';

    const tagEl = document.createElement('span');
    tagEl.className = 'article-card-tag';
    tagEl.textContent = text(tag);

    const catEl = document.createElement('span');
    catEl.className = 'article-card-category';
    catEl.textContent = text(category);

    const readEl = document.createElement('span');
    readEl.className = 'article-card-reading-time';
    readEl.textContent = text(readingTime);

    meta.append(tagEl, catEl, readEl);

    /* DATE */

    const date = document.createElement('p');
    date.className = 'article-card-published';
    date.textContent = `Published ${text(publishedDate)}`;

    /* TITLE */

    const heading = document.createElement('h2');
    heading.className = 'article-card-title';
    heading.textContent = text(title);

    /* DESCRIPTION */

    const desc = document.createElement('div');
    desc.className = 'article-card-description';

    if (description) {
      desc.innerHTML = description.innerHTML;
    }

    /* CTA */

    const ctaWrapper = document.createElement('div');
    ctaWrapper.className = 'article-card-cta';

    const href = text(link);
    const label = text(linkText);

    if (href && label) {
      const cta = document.createElement('a');

      cta.href = href;
      cta.textContent = label;

      if (text(ctaStyle).toLowerCase() === 'button') {
        cta.className = 'button primary';
      } else {
        cta.className = 'article-card-link';
      }

      ctaWrapper.append(cta);
      desc.append(ctaWrapper);
    }

    /* AUTHOR */

    const author = document.createElement('div');
    author.className = 'article-card-author';

    const authorImg = document.createElement('div');
    authorImg.className = 'article-card-author-image';

    const authorPicture = authorImage?.querySelector('picture');

    if (authorPicture) {
      authorImg.append(
        createOptimizedPicture(
          authorPicture.querySelector('img').src,
          authorPicture.querySelector('img').alt,
          false,
          [{ width: '96' }],
        ),
      );
    }

    const info = document.createElement('div');
    info.className = 'article-card-author-info';

    const authorNameEl = document.createElement('p');
    authorNameEl.className = 'article-card-author-name';
    authorNameEl.textContent = text(authorName);

    const authorRoleEl = document.createElement('p');
    authorRoleEl.className = 'article-card-author-role';
    authorRoleEl.textContent = text(authorRole);

    info.append(authorNameEl, authorRoleEl);

    author.append(authorImg, info);

    body.append(
      meta,
      date,
      heading,
      desc,
      author,
    );

    li.append(
      imageWrapper,
      body,
    );

    ul.append(li);
  });

  block.replaceChildren(ul);
}
