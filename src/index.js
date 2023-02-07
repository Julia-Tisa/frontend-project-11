import './styles.scss';
import * as yup from 'yup';
import keyBy from 'lodash/keyBy.js';
import onChange from 'on-change';
import isEmpty from 'lodash/isEmpty.js';
import render from './view.js';
const state = {
  status: 'filling',
  data: {
    url: '',
  },
  feeds: [],
  error: '',
};
const newShema = (feeds) => {
  const schema = yup.object({
    url: yup.string().url('Ссылка должна быть валидным URL').notOneOf(feeds, 'RSS уже существует'),
  });
  return schema;
};

const validate = async (fields, feeds) => {
  try {
    const s = newShema(feeds);
    await s.validate(fields, { abortEarly: false });
    return {};
  } catch (err) {
    return keyBy(err.inner, 'path');
  }
};

const form = document.querySelector('form');

const watchedState = onChange(state, (path, value) => {
  if (path === 'status') {
    render(value, watchedState);
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  watchedState.status = 'filling';
  const formData = new FormData(form);
  const value = formData.get('url');
  watchedState.data.url = value;
  const checkValid = await validate(watchedState.data, watchedState.feeds);
  if (isEmpty(checkValid) && value !== '') {
    watchedState.feeds.push(value);
    watchedState.status = 'valid';
  }
  if (!isEmpty(checkValid)) {
    watchedState.error = checkValid;
    watchedState.status = 'invalid';
  }
});
