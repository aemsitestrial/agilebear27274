import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(cell) {
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

    moveInstrumentation(row, li);

    /* Image */

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'article-card-image';

    if (image) {
      const picture = image.querySelector('picture');
      if (picture) {
        imageWrapper.append(picture.cloneNode(true));
      }
    }

    /* Body */

    const body = document.createElement('div');
    body.className = 'article-card-body';

    /* Meta */

    const meta = document.createElement('div');
    meta.className = 'article-card-meta';

    meta.innerHTML = `
      <span class="article-card-tag">${getText(tag)}</span>
      <span class="article-card-category">${getText(category)}</span>
      <span class="article-card-reading-time">${getText(readingTime)}</span>
    `;

    /* Published */

    const published = document.createElement('p');
    published.className = 'article-card-published';
    published.textContent = `Published ${getText(publishedDate)}`;

    /* Title */

    const heading = document.createElement('h2');
    heading.className = 'article-card-title';
    heading.textContent = getText(title);

    /* Description */

    const desc = document.createElement('div');
    desc.className = 'article-card-description';

    if (description) {
      desc.innerHTML = description.innerHTML;
    }

    /* CTA */

    const url = getText(link);
    const label = getText(linkText);

    if (url && label) {
      const ctaContainer = document.createElement('div');
      ctaContainer.className = 'article-card-cta';

      const cta = document.createElement('a');
      cta.href = url;

      if (getText(ctaStyle).toLowerCase() === 'button') {
        cta.className = 'button primary';
      } else {
        cta.className = 'article-card-link';
      }

      cta.textContent = label;

      ctaContainer.append(cta);
      desc.append(ctaContainer);
    }

    /* Author */

    const author = document.createElement('div');
    author.className = 'article-card-author';

    const authorPic = document.createElement('div');
    authorPic.className = 'article-card-author-image';

    if (authorImage) {
      const picture = authorImage.querySelector('picture');
      if (picture) {
        authorPic.append(picture.cloneNode(true));
      }
    }

    const authorInfo = document.createElement('div');
    authorInfo.className = 'article-card-author-info';

    authorInfo.innerHTML = `
      <p class="article-card-author-name">${getText(authorName)}</p>
      <p class="article-card-author-role">${getText(authorRole)}</p>
    `;

    author.append(authorPic, authorInfo);

    body.append(
      meta,
      published,
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

  ul.querySelectorAll('.article-card-image img').forEach((img) => {
    const pic = createOptimizedPicture(
      img.src,
      img.alt,
      false,
      [{ width: '1200' }],
    );

    img.closest('picture').replaceWith(pic);
  });

  ul.querySelectorAll('.article-card-author-image img').forEach((img) => {
    const pic = createOptimizedPicture(
      img.src,
      img.alt,
      false,
      [{ width: '96' }],
    );

    img.closest('picture').replaceWith(pic);
  });

  block.replaceChildren(ul);
}
