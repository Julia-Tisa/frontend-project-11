// Import our custom CSS
import './styles.scss';
// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap';
// Import yup
import * as yup from 'yup';

import keyBy from 'lodash/keyBy.js';

import onChange from 'on-change';

import isEmpty from 'lodash/isEmpty.js';
import has from 'lodash/has.js';

const state = {
  status: 'filling',
  data: {
    url: '',
  },
  feeds: [],
  error: '',
};
const newShema = () => {
  const schema = yup.object({
    url: yup.string().url('Ссылка должна быть валидным URL').notOneOf(state.feeds, 'RSS уже существует'),
  });
  return schema;
};

const validate = (fields) => {
  try {
    const s = newShema();
    s.validateSync(fields, { abortEarly: false });
    return {};
  } catch (err) {
    return keyBy(err.inner, 'path');
  }
};

const form = document.querySelector('form');
const input = document.querySelector('#url-input');
const feedback = document.querySelector('.feedback');

const watchedState = onChange(state, (path, value) => {
  if (path === 'status') {
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
      feedback.textContent = 'RSS успешно загружен';
      //form.reset();
    }
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  watchedState.status = 'filling';
  const formData = new FormData(form);
  const value = formData.get('url');
  watchedState.data.url = value;
  const checkValid = validate(watchedState.data);
    if (isEmpty(checkValid)) {
        watchedState.feeds.push(value);
        watchedState.status = 'valid';
      } 
    if (!isEmpty(checkValid)) {
      watchedState.error = checkValid;
      watchedState.status = 'invalid';
    }
});
