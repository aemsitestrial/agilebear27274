export default function decorate(block) {
  const rows = [...block.children];

  const getText = (index) => {
    const row = rows[index];

    if (!row) {
      return '';
    }

    return row.textContent.trim();
  };

  const getHtml = (index) => {
    const row = rows[index];

    if (!row) {
      return '';
    }

    return row.innerHTML.trim();
  };

  const getQuestions = (index) => {
    const row = rows[index];

    if (!row) {
      return [];
    }

    const values = [];

    [...row.children].forEach((item) => {
      const value = item.textContent.trim();

      if (value) {
        values.push(value);
      }
    });

    if (!values.length) {
      const value = row.textContent.trim();

      if (value) {
        values.push(value);
      }
    }

    return values;
  };

  const heading = getText(0);
  const description = getHtml(1);
  const questions = getQuestions(2);
  const ctaText = getText(3);

  const ctaLink = rows[4]?.querySelector('a')?.href
    || getText(4);

  block.innerHTML = '';

  const content = document.createElement('div');
  content.className = 'richtextcta-content';

  if (heading) {
    const title = document.createElement('h2');

    title.className = 'richtextcta-heading';
    title.textContent = heading;

    content.append(title);
  }

  if (description) {
    const descriptionElement = document.createElement('div');

    descriptionElement.className = 'richtextcta-description';
    descriptionElement.innerHTML = description;

    content.append(descriptionElement);
  }

  if (questions.length) {
    const questionsContainer = document.createElement('div');

    questionsContainer.className = 'richtextcta-questions';

    questions.forEach((question) => {
      const pill = document.createElement('button');

      pill.type = 'button';
      pill.className = 'richtextcta-question';
      pill.textContent = question;

      questionsContainer.append(pill);
    });

    content.append(questionsContainer);
  }

  if (ctaText) {
    const ctaContainer = document.createElement('div');

    ctaContainer.className = 'richtextcta-cta-container';

    const cta = document.createElement('a');

    cta.className = 'richtextcta-cta';
    cta.textContent = ctaText;

    if (ctaLink) {
      cta.href = ctaLink;
    }

    ctaContainer.append(cta);
    content.append(ctaContainer);
  }

  block.append(content);
}
