import * as yup from 'yup';
import keyBy from 'lodash/keyBy.js';
import onChange from 'on-change';
import isEmpty from 'lodash/isEmpty.js';
import i18n from 'i18next';
import axios from 'axios';
import { renderState, renderFeeds, renderPosts } from './view.js';
import parser from './parser.js';
import resources from '../locales/resources.js';
import yupSetLocale from '../locales/yupLocales.js';
import { dop } from './parser.js';

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
  };

  yupSetLocale(i18nInstance);

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

  const form = document.querySelector('form');

  const watchedState = onChange(state, (path, value) => {
    if (path === 'status') {
      renderState(value, watchedState, i18nInstance);
    }
    if (path === 'feeds') {
      renderFeeds(watchedState);
    }
    if (path === 'posts') {
      renderPosts(watchedState);
    }
  });

  const createUrl = (usersUrl) => {
    const url = new URL('https://allorigins.hexlet.app/get');
    url.searchParams.append('disableCache', 'true');
    url.searchParams.append('url', usersUrl);
    return url.toString();
  };

  const goNetwork = async (urlValue) => {
    try {
      const urlRequest = createUrl(urlValue);
      const response = await axios.get(urlRequest, { timeout: 5000 });
      const { contents } = response.data;
      const parsedContent = parser(contents, watchedState.actualPostID, watchedState.posts);
      if (parsedContent === 'errorRss') {
        watchedState.status = 'fall';
      } else {
        watchedState.actualPostID = parsedContent.id;
        watchedState.feeds.push(parsedContent.dataFeeds);
        watchedState.posts = parsedContent.newPosts;
        watchedState.urls.push(urlValue);
        watchedState.status = 'valid';
      }
    } catch {
      watchedState.status = 'networkError';
    }
  };
  const update = () => {
    let timerId = setTimeout(function tick() {
      watchedState.urls.forEach(async (urlValue) => {
        try {
          const urlRequest = createUrl(urlValue);
          const response = await axios.get(urlRequest, { timeout: 5000 });
          const { contents } = response.data;
          const parsedContent = parser(contents, watchedState.actualPostID, watchedState.posts);
          if (parsedContent !== 'errorRss') {
            watchedState.actualPostID = parsedContent.id;
            watchedState.posts = parsedContent.newPosts;
          }
        } catch (err) {
          console.log(err);
        }
      });
      timerId = setTimeout(tick, 5000);
    }, 5000);
    console.log(timerId);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    watchedState.status = 'filling';
    const formData = new FormData(form);
    const value = formData.get('url');
    const checkValid = await validate({ url: value }, watchedState.urls);
    if (isEmpty(checkValid)) {
      goNetwork(value);
      update();
    }
    if (!isEmpty(checkValid)) {
      watchedState.error = checkValid;
      watchedState.status = 'invalid';
    }
  });
};
