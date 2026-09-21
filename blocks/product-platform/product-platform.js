function decorateLink(cell, className) {
  cell.classList.add(className);
  const link = cell.querySelector('a');
  if (link) link.classList.remove('button');
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];

    if (cells.length === 2) {
      row.classList.add('product-platform-header');
      cells[0].classList.add('product-platform-title');
      decorateLink(cells[1], 'product-platform-view-all');
      return;
    }

    if (cells.length >= 3) {
      row.classList.add('product-platform-item');
      cells[0].classList.add('product-platform-brand');
      cells[1].classList.add('product-platform-description');
      decorateLink(cells[2], 'product-platform-link');
    }
  });
}
