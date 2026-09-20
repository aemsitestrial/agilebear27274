import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const TITLE_TYPES = ['h2', 'h3', 'h4'];

function getText(element) {
  return element?.textContent?.trim() || '';
}

function getImage(element) {
  if (!element) return null;

  if (element.matches('img')) {
    return element;
  }

  return element.querySelector('img');
}

function getLink(element) {
  if (!element) return null;

  if (element.matches('a')) {
    return element;
  }

  return element.querySelector('a');
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (text) {
    element.textContent = text;
  }

  return element;
}

/**
 * Get article-card items from Universal Editor markup.
 *
 * Supported structures:
 *
 * 1. data-aue-model wrappers
 * 2. Direct child item wrappers
 * 3. Flat EDS markup separated by horizontal rules
 */
function getCardItems(block) {
  const modelItems = [
    ...block.querySelectorAll(':scope > [data-aue-model="article-card"]'),
  ];

  if (modelItems.length) {
    return modelItems;
  }

  const directChildren = [...block.children];

  const itemChildren = directChildren.filter(
    (child) => child.children.length > 0,
  );

  if (itemChildren.length) {
    return itemChildren;
  }

  const cards = [];
  let current = [];

  directChildren.forEach((child) => {
    if (child.tagName === 'HR') {
      if (current.length) {
        cards.push(current);
        current = [];
      }
    } else {
      current.push(child);
    }
  });

  if (current.length) {
    cards.push(current);
  }

  return cards;
}

function getFields(item) {
  const elements = Array.isArray(item)
    ? item
    : [...item.children];

  return {
    image: elements[0],
    imageAlt: elements[1],
    tag: elements[2],
    category: elements[3],
    readTime: elements[4],
    published: elements[5],
    title: elements[6],
    titleType: elements[7],
    description: elements[8],
    cta: elements[9],
    ctaText: elements[10],
    authorImage: elements[11],
    authorName: elements[12],
    authorRole: elements[13],
  };
}

function buildMeta(fields) {
  const tag = getText(fields.tag);
  const category = getText(fields.category);
  const readTime = getText(fields.readTime);

  if (!tag && !category && !readTime) {
    return null;
  }

  const meta = createElement(
    'div',
    'article-cards-meta',
  );

  if (tag) {
    meta.append(
      createElement(
        'span',
        'article-cards-tag',
        tag,
      ),
    );
  }

  if (category) {
    meta.append(
      createElement(
        'span',
        'article-cards-category',
        category,
      ),
    );
  }

  if (readTime) {
    meta.append(
      createElement(
        'span',
        'article-cards-readTime',
        readTime,
      ),
    );
  }

  return meta;
}

function buildTitle(fields) {
  const title = getText(fields.title);

  if (!title) {
    return null;
  }

  const authoredType = getText(fields.titleType);

  const titleType = TITLE_TYPES.includes(authoredType)
    ? authoredType
    : 'h3';

  const heading = createElement(
    titleType,
    null,
    title,
  );

  if (fields.title) {
    moveInstrumentation(
      fields.title,
      heading,
    );
  }

  return heading;
}

function buildCTA(fields, isFeatured) {
  const ctaText = getText(fields.ctaText);
  const authoredLink = getLink(fields.cta);

  if (!ctaText && !authoredLink) {
    return null;
  }

  const link = document.createElement('a');

  link.className = 'article-cards-cta';

  if (authoredLink?.href) {
    link.href = authoredLink.href;
  }

  if (authoredLink?.target) {
    link.target = authoredLink.target;
  }

  if (authoredLink?.rel) {
    link.rel = authoredLink.rel;
  }

  link.textContent =
    ctaText ||
    getText(authoredLink) ||
    'Read more';

  if (isFeatured) {
    link.classList.add(
      'article-cards-cta-featured',
    );
  }

  return link;
}

function buildAuthor(fields) {
  const authorName = getText(fields.authorName);
  const authorRole = getText(fields.authorRole);
  const authorImage = getImage(
    fields.authorImage,
  );

  if (
    !authorName &&
    !authorRole &&
    !authorImage
  ) {
    return null;
  }

  const author = createElement(
    'div',
    'article-cards-author',
  );

  if (authorImage) {
    const avatar = createElement(
      'div',
      'article-cards-avatar',
    );

    avatar.append(authorImage);

    author.append(avatar);
  }

  if (authorName || authorRole) {
    const authorInfo = createElement(
      'div',
      'article-cards-author-info',
    );

    if (authorName) {
      authorInfo.append(
        createElement(
          'div',
          'article-cards-authorName',
          authorName,
        ),
      );
    }

    if (authorRole) {
      authorInfo.append(
        createElement(
          'div',
          'article-cards-authorRole',
          authorRole,
        ),
      );
    }

    author.append(authorInfo);
  }

  return author;
}

function buildCard(item) {
  const fields = getFields(item);

  const image = getImage(fields.image);
  const imageAlt = getText(
    fields.imageAlt,
  );

  const isFeatured = !image;

  const card = document.createElement('li');

  if (isFeatured) {
    card.classList.add('is-featured');
  }

  /*
   * Standard card image.
   *
   * Featured cards intentionally do not render
   * an image container.
   */
  if (image) {
    image.alt = imageAlt;

    const imageWrapper = createElement(
      'div',
      'article-cards-image',
    );

    imageWrapper.append(image);

    card.append(imageWrapper);
  }

  /*
   * Main content area.
   */
  const content = createElement(
    'div',
    'article-cards-content',
  );

  /*
   * Metadata.
   */
  const meta = buildMeta(fields);

  if (meta) {
    content.append(meta);
  }

  /*
   * Published text.
   */
  const published = getText(
    fields.published,
  );

  if (published) {
    content.append(
      createElement(
        'div',
        'article-cards-published',
        published,
      ),
    );
  }

  /*
   * Title + description.
   */
  const text = createElement(
    'div',
    'article-cards-text',
  );

  const title = buildTitle(fields);

  if (title) {
    text.append(title);
  }

  const description = getText(
    fields.description,
  );

  if (description) {
    text.append(
      createElement(
        'p',
        null,
        description,
      ),
    );
  }

  content.append(text);

  /*
   * CTA.
   */
  const cta = buildCTA(
    fields,
    isFeatured,
  );

  if (cta) {
    const ctaWrapper = createElement(
      'div',
      'article-cards-link',
    );

    ctaWrapper.append(cta);

    content.append(ctaWrapper);
  }

  card.append(content);

  /*
   * Author.
   */
  const author = buildAuthor(fields);

  if (author) {
    card.append(author);
  }

  return card;
}

function optimizeMainImages(block) {
  block
    .querySelectorAll(
      '.article-cards-image picture > img',
    )
    .forEach((img) => {
      const picture = img.closest('picture');

      if (!picture) {
        return;
      }

      const optimizedPicture =
        createOptimizedPicture(
          img.src,
          img.alt || '',
          false,
          [{ width: '750' }],
        );

      const optimizedImage =
        optimizedPicture.querySelector('img');

      if (optimizedImage) {
        moveInstrumentation(
          img,
          optimizedImage,
        );
      }

      picture.replaceWith(
        optimizedPicture,
      );
    });
}

function optimizeAuthorImages(block) {
  block
    .querySelectorAll(
      '.article-cards-avatar picture > img',
    )
    .forEach((img) => {
      const picture = img.closest('picture');

      if (!picture) {
        return;
      }

      const optimizedPicture =
        createOptimizedPicture(
          img.src,
          img.alt || '',
          false,
          [{ width: '96' }],
        );

      const optimizedImage =
        optimizedPicture.querySelector('img');

      if (optimizedImage) {
        moveInstrumentation(
          img,
          optimizedImage,
        );
      }

      picture.replaceWith(
        optimizedPicture,
      );
    });
}

export default function decorate(block) {
  const items = getCardItems(block);

  const ul = document.createElement('ul');

  items.forEach((item) => {
    const card = buildCard(item);

    if (!Array.isArray(item)) {
      moveInstrumentation(
        item,
        card,
      );
    }

    ul.append(card);
  });

  block.replaceChildren(ul);

  optimizeMainImages(block);
  optimizeAuthorImages(block);
}
