import * as yup from 'yup';
import keyBy from 'lodash/keyBy.js';
import onChange from 'on-change';
import isEmpty from 'lodash/isEmpty.js';
import i18n from 'i18next';
import { renderFeeds, renderState } from './view.js';
import axios from 'axios';
import parser from './parser.js';

export default async () => {
  const i18nInstance = i18n.createInstance();
  await i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru: {
        translation: {
          success: 'RSS успешно загружен',
          notOneOf: 'RSS уже существует',
          notValid: 'Ссылка должна быть валидным URL',
          fall: 'Ресурс не содержит валидный RSS',
        },
      },
    },
  });

  const state = {
    status: 'filling',
    urls: [],
    error: '',
    feeds: [],
    posts: [],
    actualID: 0,
  };

  yup.setLocale({
    mixed: {
      notOneOf: i18nInstance.t('notOneOf'),
    },
    string: {
      url: i18nInstance.t('notValid'),
    },
  });

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
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    watchedState.status = 'filling';
    const formData = new FormData(form);
    const value = formData.get('url');
    const checkValid = await validate({ url: value }, watchedState.urls);
    if (isEmpty(checkValid)) {
      try {
        const response = await axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(`${value}`)}`);
        const { contents } = response.data;
        const parsedContent = parser(contents);
        const rss = parsedContent.querySelector('rss');
        if (rss === null) {
          watchedState.status = 'fall';
        } else {
          watchedState.actualID += 1;
          const titleFeeds = parsedContent.querySelector('title');
          const descriptionFeeds = parsedContent.querySelector('description');
          watchedState.feeds.push({
            id: watchedState.actualID,
            title: titleFeeds.textContent,
            description: descriptionFeeds.textContent,
          });
          renderFeeds(watchedState);
          watchedState.urls.push(value);
          watchedState.status = 'valid';
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (!isEmpty(checkValid)) {
      watchedState.error = checkValid;
      watchedState.status = 'invalid';
    }
  });
};
