import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const getText = (element) => element?.textContent?.trim() || '';

const getImage = (element) => {
  if (!element) return null;

  return element.querySelector('img');
};

const getLink = (element) => {
  if (!element) return null;

  return element.querySelector('a');
};

const createElement = (tag, className, text = '') => {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text) {
    element.textContent = text;
  }

  return element;
};

/**
 * Get Article Card item blocks.
 *
 * Universal Editor can produce slightly different wrapper structures
 * depending on the container/item configuration, so this supports:
 *
 * .article-card
 * direct child items
 * nested child wrappers
 */
function getArticleCardItems(block) {
  const explicitItems = [
    ...block.querySelectorAll(':scope > .article-card'),
  ];

  if (explicitItems.length) {
    return explicitItems;
  }

  const directChildren = [...block.children];

  if (
    directChildren.length
    && directChildren.every((child) => child.children.length)
  ) {
    const nestedItems = directChildren.flatMap((child) => [
      ...child.children,
    ]);

    if (nestedItems.length) {
      return nestedItems;
    }
  }

  return directChildren;
}

/**
 * Extract the 14 authored fields from one Article Card.
 */
function getCardFields(card) {
  const rows = [...card.children];

  /*
   * Universal Editor item markup normally becomes:
   *
   * <div>
   *   <div>image</div>
   *   <div>alt</div>
   *   <div>tag</div>
   *   ...
   * </div>
   *
   * Some generated markup can contain one additional wrapper.
   */
  let cells = rows;

  if (
    rows.length === 1
    && rows[0].children.length > 1
  ) {
    cells = [...rows[0].children];
  }

  const getCell = (index) => cells[index] || null;

  return {
    image: getImage(getCell(0)),
    imageAlt: getText(getCell(1)),
    tag: getText(getCell(2)),
    category: getText(getCell(3)),
    readTime: getText(getCell(4)),
    published: getText(getCell(5)),
    title: getText(getCell(6)),
    titleLevel: getText(getCell(7)) || 'h3',
    description: getText(getCell(8)),
    ctaLink: getLink(getCell(9)),
    ctaText: getText(getCell(10)),
    authorImage: getImage(getCell(11)),
    authorName: getText(getCell(12)),
    authorRole: getText(getCell(13)),
  };
}

function createMeta(fields) {
  const meta = createElement('div', 'article-cards-meta');

  if (fields.tag) {
    const tag = createElement(
      'span',
      'article-cards-tag',
      fields.tag,
    );

    meta.append(tag);
  }

  if (fields.category) {
    const category = createElement(
      'span',
      'article-cards-category',
      fields.category,
    );

    meta.append(category);
  }

  if (fields.readTime) {
    const readTime = createElement(
      'span',
      'article-cards-read-time',
      fields.readTime,
    );

    meta.append(readTime);
  }

  return meta;
}

function createPublished(fields) {
  if (!fields.published) return null;

  return createElement(
    'div',
    'article-cards-published',
    fields.published,
  );
}

function createTitle(fields) {
  const allowedLevels = ['h2', 'h3', 'h4'];

  const level = allowedLevels.includes(fields.titleLevel)
    ? fields.titleLevel
    : 'h3';

  const title = createElement(
    level,
    'article-cards-title',
    fields.title,
  );

  return title;
}

function createDescription(fields) {
  if (!fields.description) return null;

  return createElement(
    'p',
    'article-cards-description',
    fields.description,
  );
}

function createCTA(fields) {
  if (
    !fields.ctaText
    && !fields.ctaLink
  ) {
    return null;
  }

  const cta = createElement(
    'div',
    'article-cards-cta-wrapper',
  );

  const link = document.createElement('a');

  link.className = 'article-cards-cta';

  if (fields.ctaLink?.href) {
    link.href = fields.ctaLink.href;
  }

  if (fields.ctaLink?.target) {
    link.target = fields.ctaLink.target;
  }

  if (fields.ctaLink?.rel) {
    link.rel = fields.ctaLink.rel;
  }

  link.textContent = fields.ctaText || getText(fields.ctaLink);

  const arrow = createElement(
    'span',
    'article-cards-cta-arrow',
  );

  arrow.setAttribute('aria-hidden', 'true');

  link.append(arrow);
  cta.append(link);

  return cta;
}

function createAuthor(fields) {
  if (
    !fields.authorImage
    && !fields.authorName
    && !fields.authorRole
  ) {
    return null;
  }

  const author = createElement(
    'div',
    'article-cards-author',
  );

  if (fields.authorImage) {
    const authorImage = createOptimizedPicture(
      fields.authorImage.src,
      fields.authorImage.alt || fields.authorName || 'Author',
      false,
      [
        {
          width: 96,
        },
      ],
    );

    authorImage.className = 'article-cards-author-image';

    author.append(authorImage);
  }

  const authorInfo = createElement(
    'div',
    'article-cards-author-info',
  );

  if (fields.authorName) {
    authorInfo.append(
      createElement(
        'div',
        'article-cards-author-name',
        fields.authorName,
      ),
    );
  }

  if (fields.authorRole) {
    authorInfo.append(
      createElement(
        'div',
        'article-cards-author-role',
        fields.authorRole,
      ),
    );
  }

  author.append(authorInfo);

  return author;
}

function createArticleCard(card, index) {
  const fields = getCardFields(card);

  /*
   * NO IMAGE = FEATURED CARD
   *
   * This is what produces the grey middle card
   * shown in your reference image.
   */
  const isFeatured = !fields.image;

  const article = document.createElement('article');

  article.className = 'article-cards-card';

  if (isFeatured) {
    article.classList.add('article-cards-card--featured');
  }

  article.dataset.cardIndex = String(index + 1);

  moveInstrumentation(card, article);

  /*
   * Image area
   */
  if (fields.image && !isFeatured) {
    const imageWrapper = createElement(
      'div',
      'article-cards-image-wrapper',
    );

    const picture = createOptimizedPicture(
      fields.image.src,
      fields.image.alt || fields.imageAlt || '',
      false,
      [
        {
          media: '(min-width: 900px)',
          width: 750,
        },
        {
          width: 600,
        },
      ],
    );

    picture.className = 'article-cards-image';

    imageWrapper.append(picture);
    article.append(imageWrapper);
  }

  /*
   * Content area
   */
  const content = createElement(
    'div',
    'article-cards-content',
  );

  const meta = createMeta(fields);

  if (meta.children.length) {
    content.append(meta);
  }

  const published = createPublished(fields);

  if (published) {
    content.append(published);
  }

  if (fields.title) {
    content.append(createTitle(fields));
  }

  const description = createDescription(fields);

  if (description) {
    content.append(description);
  }

  const cta = createCTA(fields);

  if (cta) {
    content.append(cta);
  }

  const author = createAuthor(fields);

  if (author) {
    content.append(author);
  }

  article.append(content);

  return article;
}

export default function decorate(block) {
  const items = getArticleCardItems(block);

  const list = document.createElement('ul');

  list.className = 'article-cards-list';

  items.forEach((item, index) => {
    const listItem = document.createElement('li');

    listItem.className = 'article-cards-item';

    listItem.append(
      createArticleCard(item, index),
    );

    list.append(listItem);
  });

  block.replaceChildren(list);
}
