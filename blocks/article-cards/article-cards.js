export default function decorate(block) {
  block.classList.add('insight-cards');

  const rows = [...block.children];

  if (rows.length === 0) return;

  const fields = rows.map((row) => row.firstElementChild || row);

  const extractText = (el) => el?.querySelector('p, div, a')?.textContent?.trim() || el?.textContent?.trim() || '';

  const extractHref = (el) => el?.querySelector('a')?.getAttribute('href') || extractText(el) || '#';

  const extractRichText = (el) => {
    if (!el) return '';

    const innerContent = el.querySelector('p, h1, h2, h3, h4, div');

    return innerContent ? innerContent.outerHTML : el.innerHTML;
  };

  const renderImg = (container, alt) => {
    if (!container) return '';

    const imgOrPicture = container.querySelector('picture, img');

    if (imgOrPicture) return imgOrPicture.outerHTML;

    const url = extractText(container);

    if (!url) return '';

    if (url.includes('<img')) return url;

    return `<img src="${url}" alt="${alt}" loading="lazy" />`;
  };

  // Extract simple fields sequentially

  const imageHtml = renderImg(fields[0], 'Card Hero');

  const tagCategory = extractText(fields[1]);

  const tagSubcategory = extractText(fields[2]);

  const readTime = extractText(fields[3]);

  const publishDate = extractText(fields[4]);

  const titleHtml = extractRichText(fields[5]);

  const descriptionText = extractText(fields[6]);

  const ctaText = extractText(fields[7]);

  const ctaLink = extractHref(fields[8]);

  const ctaStyle = extractText(fields[9]).toLowerCase();

  const authorAvatarHtml = renderImg(fields[10], 'Author Avatar');

  const authorName = extractText(fields[11]);

  const authorTitle = extractText(fields[12]);

  const isFeatured = !imageHtml && tagCategory;

  block.innerHTML = `
<article class="insight-card ${isFeatured ? 'featured-card' : ''}">

      ${imageHtml ? `<div class="card-image-wrapper">${imageHtml}</div>` : ''}
<div class="card-body">
<div class="card-meta-top">
<div class="card-badges">

            ${tagCategory ? `<span class="badge badge-category">${tagCategory}</span>` : ''}

            ${tagSubcategory ? `<span class="badge badge-subcategory">${tagSubcategory}</span>` : ''}
</div>

          ${readTime ? `<span class="card-read-time">${readTime}</span>` : ''}
</div>
 
        ${publishDate ? `<p class="card-publish-date">${publishDate}</p>` : ''}

        ${titleHtml ? `<div class="card-title-wrapper">${titleHtml}</div>` : ''}

        ${descriptionText ? `<p class="card-description">${descriptionText}</p>` : ''}
 
        ${ctaText ? `
<div class="card-cta-wrapper">
<a href="${ctaLink}" class="card-cta ${ctaStyle === 'button' ? 'cta-button' : 'cta-link'}">
<span>${ctaText}</span>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<line x1="5" y1="12" x2="19" y2="12"></line>
<polyline points="12 5 19 12 12 19"></polyline>
</svg>
</a>
</div>

        ` : ''}
 
        ${(authorName || authorAvatarHtml) ? `
<div class="card-author">

            ${authorAvatarHtml ? `<div class="author-avatar">${authorAvatarHtml}</div>` : ''}
<div class="author-details">

              ${authorName ? `<span class="author-name">${authorName}</span>` : ''}

              ${authorTitle ? `<span class="author-title">${authorTitle}</span>` : ''}
</div>
</div>

        ` : ''}
</div>
</article>

  `;
}
