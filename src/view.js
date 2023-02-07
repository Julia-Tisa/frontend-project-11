import has from 'lodash/has.js';

const form = document.querySelector('form');
const input = document.querySelector('#url-input');
const feedback = document.querySelector('.feedback');

export default (value, watchedState, i18nInstance) => {
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
};
