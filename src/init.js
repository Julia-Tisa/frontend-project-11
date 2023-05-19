import 'bootstrap';
import * as yup from 'yup';
import keyBy from 'lodash/keyBy.js';
import isEmpty from 'lodash/isEmpty.js';
import i18n from 'i18next';
import render from './view.js';
import { firstRequestData, updateData } from './requests.js';
import resources from './locales/resources.js';
import yupSetLocale from './locales/yupLocales.js';

export default () => {
  const i18nInstance = i18n.createInstance();
  return i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  })
    .then(() => {
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

      const validate = (fields, urls) => {
        const s = newShema(urls);
        return s.validate(fields, { abortEarly: false })
          .then(() => ({}))
          .catch((err) => keyBy(err.inner, 'path'));
      };

      const elements = {
        form: document.querySelector('form'),
        input: document.querySelector('#url-input'),
        feedback: document.querySelector('.feedback'),
        headerFeeds: document.querySelector('.card-body.feeds'),
        listFeeds: document.querySelector('.list-group.feeds'),
        headerPosts: document.querySelector('.card-body.posts'),
        listPosts: document.querySelector('.list-group.posts'),
      };

      const { watchedState } = render(state, i18nInstance, elements);

      elements.listPosts.addEventListener('click', () => {
        const links = document.querySelectorAll('a.fw-bold');
        links.forEach((link) => {
          link.addEventListener('click', () => {
            const { id } = link.dataset;
            link.classList.remove('fw-bold');
            link.classList.add('fw-normal', 'link-secondary');
            watchedState.uiState.viewedPosts.push(id);
          }, true);
        });

        const buttons = document.querySelectorAll('.btn-sm');
        buttons.forEach((button) => {
          button.addEventListener('click', () => {
            const { id } = button.dataset;
            if (watchedState.uiState.viewedPosts.indexOf(id) === -1) {
              const a = button.previousElementSibling;
              a.classList.remove('fw-bold');
              a.classList.add('fw-normal', 'link-secondary');
              watchedState.uiState.viewedPosts.push(id);
            }
            const post = watchedState.posts.find((item) => item.id === Number(id));
            const h5 = document.querySelector('h5');
            h5.textContent = post.title;
            const description = document.querySelector('.modal-body.text-break');
            description.textContent = post.description;
            const aRead = document.querySelector('a');
            aRead.removeAttribute('href');
            aRead.setAttribute('href', post.url);
          }, true);
        });
      }, true);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.status = 'filling';
        const formData = new FormData(elements.form);
        const value = formData.get('url');
        validate({ url: value }, watchedState.urls)
          .then((checkValid) => {
            if (isEmpty(checkValid)) {
              return firstRequestData(value, watchedState)
                .then(() => updateData(watchedState));
            }
            watchedState.error = checkValid;
            watchedState.status = 'invalid';
            return Promise.resolve();
          });
      });
    });
};
