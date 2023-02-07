import * as yup from 'yup';
import keyBy from 'lodash/keyBy.js';
import onChange from 'on-change';
import isEmpty from 'lodash/isEmpty.js';
import i18n from 'i18next';
import render from './view.js';

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
        },
      },
    },
  });

  const state = {
    status: 'filling',
    data: {
      url: '',
    },
    feeds: [],
    error: '',
  };

  yup.setLocale({
    mixed: {
      notOneOf: i18nInstance.t('notOneOf'),
    },
    string: {
      url: i18nInstance.t('notValid'),
    },
  });

  const newShema = (feeds) => {
    const schema = yup.object({
      url: yup.string().url().notOneOf(feeds),
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
      render(value, watchedState, i18nInstance);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    watchedState.status = 'filling';
    const formData = new FormData(form);
    const value = formData.get('url');
    watchedState.data.url = value;
    const checkValid = await validate(watchedState.data, watchedState.feeds);
    if (isEmpty(checkValid)) {
      watchedState.feeds.push(value);
      watchedState.status = 'valid';
    }
    if (!isEmpty(checkValid)) {
      watchedState.error = checkValid;
      watchedState.status = 'invalid';
    }
  });
};
