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
      const parsedContent = parser(contents);
      const rss = parsedContent.querySelector('rss');
      if (rss === null) {
        watchedState.status = 'fall';
      } else {
        const titleFeeds = parsedContent.querySelector('title');
        const descriptionFeeds = parsedContent.querySelector('description');
        const dataFeeds = {
          title: titleFeeds.textContent,
          description: descriptionFeeds.textContent,
        };
        watchedState.feeds.push(dataFeeds);
        const itemsPosts = parsedContent.querySelectorAll('item');
        itemsPosts.forEach((item) => {
          watchedState.actualPostID += 1;
          const link = item.querySelector('link');
          const url = link.nextSibling.wholeText;
          const title = item.querySelector('title');
          const description = item.querySelector('description');
          const dataPosts = {
            status: 'new',
            id: watchedState.actualPostID,
            title: title.textContent,
            description: description.textContent,
            url,
          };
          watchedState.posts.push(dataPosts);
        });
        watchedState.urls.push(urlValue);
        watchedState.status = 'valid';
      }
    } catch {
      console.log(createUrl(urlValue));
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
          const parsedContent = parser(contents);
          const rss = parsedContent.querySelector('rss');
          if (rss !== null) {
            const itemsPosts = parsedContent.querySelectorAll('item');
            itemsPosts.forEach((item) => {
              watchedState.actualPostID += 1;
              const link = item.querySelector('link');
              const url = link.nextSibling.wholeText;
              const title = item.querySelector('title');
              const description = item.querySelector('description');
              const dataPosts = {
                status: 'new',
                id: watchedState.actualPostID,
                title: title.textContent,
                description: description.textContent,
                url,
              };
              const filter = watchedState.posts.filter((post) => post.title === dataPosts.title);
              if (filter.length === 0) {
                watchedState.posts.push(dataPosts);
              }
            });
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
