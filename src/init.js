import * as yup from 'yup';
import keyBy from 'lodash/keyBy.js';
import isEmpty from 'lodash/isEmpty.js';
import i18n from 'i18next';
import axios from 'axios';
import render from './view.js';
import parser from './parser.js';
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

  const form = document.querySelector('form');

  const utils = render(state, i18nInstance);

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
      const parsedContent = parser(contents);
      utils.urls.push(urlValue);
      utils.feeds.push(parsedContent.dataFeed);
      parsedContent.dataPosts.forEach((itemPost) => {
        const newPost = itemPost;
        utils.actualPostID += 1;
        newPost.id = utils.actualPostID;
        utils.posts.push(newPost);
      });
      utils.status = 'valid';
    } catch (err) {
      if (err.isParsingError) {
        utils.status = 'fall';
      } else {
        utils.status = 'networkError';
      }
    }
  };
  const update = () => {
    let timerId = setTimeout(function tick() {
      utils.urls.forEach(async (urlValue) => {
        try {
          const urlRequest = createUrl(urlValue);
          const response = await axios.get(urlRequest, { timeout: 5000 });
          const { contents } = response.data;
          const parsedContent = parser(contents);
          parsedContent.dataPosts.forEach((itemPost) => {
            const filter = utils.posts.filter((post) => post.title === itemPost.title);
            if (filter.length === 0) {
              utils.actualPostID += 1;
              const newPost = itemPost;
              newPost.id = utils.actualPostID;
              utils.posts.push(newPost);
            }
          });
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
    utils.status = 'filling';
    const formData = new FormData(form);
    const value = formData.get('url');
    const checkValid = await validate({ url: value }, utils.urls);
    if (isEmpty(checkValid)) {
      await goNetwork(value);
      await update();
    }
    if (!isEmpty(checkValid)) {
      utils.error = checkValid;
      utils.status = 'invalid';
    }
  });
};
