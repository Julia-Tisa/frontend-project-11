import has from 'lodash/has.js';

const form = document.querySelector('form');
const input = document.querySelector('#url-input');
const feedback = document.querySelector('.feedback');

const renderState = (value, watchedState, i18nInstance) => {
  if (value === 'invalid') {
    const { error } = watchedState;
    input.classList.add('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    if (has(error, 'url')) {
      feedback.textContent = `${error.url.message}`;
    } else {
      feedback.textContent = error;
    }
  }
  if (value === 'valid') {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-success');
    feedback.textContent = i18nInstance.t('success');
    form.reset();
  }
  if (value === 'fall') {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = i18nInstance.t('fall');
  }
};

const renderFeeds = (watchedState) => {
  const h2Container = document.querySelector('.card-body.feeds');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = 'Fids';
  h2Container.innerHTML = '';
  h2Container.append(h2);

  const ulContainer = document.querySelector('.list-group.feeds');
  ulContainer.innerHTML = '';
  watchedState.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h-6', 'm-0');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(p);
    li.prepend(h3);
    ulContainer.prepend(li);
  });
};

export { renderFeeds, renderState };
