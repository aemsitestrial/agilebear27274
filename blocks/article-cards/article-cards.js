import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');

    moveInstrumentation(row, li);

    while (row.firstElementChild) {
      li.append(row.firstElementChild);
    }

    [...li.children].forEach((div, index) => {
      if (index === 0 && div.querySelector('picture')) {
        div.className = 'article-card-image';
      } else {
        div.className = 'article-card-body';
      }
    });

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
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

    img.closest('picture').replaceWith(optimizedPicture);
  });

  block.replaceChildren(ul);
}
