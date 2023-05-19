import 'bootstrap';
import * as yup from 'yup';
import keyBy from 'lodash/keyBy.js';
import isEmpty from 'lodash/isEmpty.js';
import i18n from 'i18next';
import render from './view.js';
import { goNetwork, update } from './requests.js';
import resources from './locales/resources.js';
import yupSetLocale from './locales/yupLocales.js';

export default async () => {
  const i18nInstance = i18n.createInstance();
  await i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const state = {
    status: 'filling',
    urls: [],
    error: '',
    feeds: [],
    posts: [],
    actualPostID: 0,
    uiState: {
      viewedPosts: [],
    },
  };

  yupSetLocale();

  const newShema = (urls) => {
    const schema = yup.object({
      url: yup.string().url().notOneOf(urls),
    });
    return schema;
  };

  const validate = async (fields, urls) => {
    try {
      const s = newShema(urls);
      await s.validate(fields, { abortEarly: false });
      return {};
    } catch (err) {
      return keyBy(err.inner, 'path');
    }
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    containerFeeds: document.querySelector('.card-body.feeds'),
    ulFeeds: document.querySelector('.list-group.feeds'),
    containerPosts: document.querySelector('.card-body.posts'),
    ulPosts: document.querySelector('.list-group.posts'),
  };

  const { watchedState } = render(state, i18nInstance, elements);

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    watchedState.status = 'filling';
    const formData = new FormData(elements.form);
    const value = formData.get('url');
    const checkValid = await validate({ url: value }, watchedState.urls);
    if (isEmpty(checkValid)) {
      await goNetwork(value, watchedState);
      await update(watchedState);
    }
    if (!isEmpty(checkValid)) {
      watchedState.error = checkValid;
      watchedState.status = 'invalid';
    }
  });
};
