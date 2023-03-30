import has from 'lodash/has.js';

const form = document.querySelector('form');
const input = document.querySelector('#url-input');
const feedback = document.querySelector('.feedback');

const renderState = (value, watchedState, i18nInstance) => {
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
  if (value === 'fall') {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = i18nInstance.t('fall');
  }
  if (value === 'networkError') {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = i18nInstance.t('networkError');
  }
};

const renderFeeds = (watchedState) => {
  const h2Container = document.querySelector('.card-body.feeds');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = 'Фиды';
  h2Container.innerHTML = '';
  h2Container.append(h2);

  const ulContainer = document.querySelector('.list-group.feeds');
  ulContainer.innerHTML = '';
  watchedState.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h-6', 'm-0');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(p);
    li.prepend(h3);
    ulContainer.prepend(li);
  });
};

const renderPosts = (watchedState) => {
  const containerPosts = document.querySelector('.card-body.posts');
  containerPosts.innerHTML = '';
  const h2Posts = document.createElement('h2');
  h2Posts.classList.add('card-title', 'h4');
  h2Posts.textContent = 'Посты';
  containerPosts.append(h2Posts);

  const ulPosts = document.querySelector('.list-group.posts');
  ulPosts.innerHTML = '';
  watchedState.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.setAttribute('href', post.url);
    if (watchedState.uiState.viewedPosts.indexOf(post.id.toString()) === -1) {
      a.classList.add('fw-bold');
    } else {
      a.classList.add('fw-normal', 'link-secondary');
    }
    a.setAttribute('data-id', post.id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = post.title;
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = 'Просмотр';
    li.append(a);
    li.append(button);
    ulPosts.prepend(li);
  });
};

const renderLinks = (watchedState) => {
  const links = document.querySelectorAll('a');
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const { id } = link.dataset;
      if (watchedState.uiState.viewedPosts.indexOf(id.toString()) === -1) {
        e.preventDefault();
        link.classList.remove('fw-bold');
        link.classList.add('fw-normal', 'link-secondary');
        watchedState.uiState.viewedPosts.push(id);
      }
    });
  });
};
/* Не получилось убрать навешивание листенера при создании на кнопки закрытия,
так как оно навешивается только при создании модального окна, и это только
две кнопки для закрытия, если это принципиально, думаю, можно добавить
в стейт флаг на закрытое/открытое модальное окно, и в слушателе вызывать рендер
закрывающих кнопок. */
const renderButtons = (watchedState) => {
  const buttons = document.querySelectorAll('.btn-sm');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const { id } = button.dataset;
      if (watchedState.uiState.viewedPosts.indexOf(id.toString()) === -1) {
        const a = button.previousElementSibling;
        a.classList.remove('fw-bold');
        a.classList.add('fw-normal', 'link-secondary');
        watchedState.uiState.viewedPosts.push(id);
      }
      const body = document.querySelector('body');
      body.classList.add('modal-open');
      body.setAttribute('style', 'overflow: hidden; padding-right: 0px;');
      const modalContainer = document.querySelector('.modal.fade');
      modalContainer.classList.add('show');
      modalContainer.removeAttribute('aria-hidden');
      modalContainer.setAttribute('aria-model', 'true');
      modalContainer.setAttribute('style', 'display: block;');
      const post = watchedState.posts.find((item) => item.id === Number(id));
      const h5 = document.querySelector('h5');
      h5.textContent = post.title;
      const description = document.querySelector('.modal-body.text-break');
      description.textContent = post.description;
      const aRead = document.querySelector('a');
      aRead.removeAttribute('href');
      aRead.setAttribute('href', post.url);
      const closeButtons = document.querySelectorAll('[data-bs-dismiss="modal"]');
      closeButtons.forEach((closeButton) => {
        closeButton.addEventListener('click', () => {
          body.classList.remove('modal-open');
          body.removeAttribute('style');
          modalContainer.classList.remove('show');
          modalContainer.setAttribute('aria-hidden', 'true');
          modalContainer.removeAttribute('aria-model');
          modalContainer.removeAttribute('style');
        });
      });
    });
  });
};

export {
  renderState, renderFeeds, renderPosts, renderLinks, renderButtons,
};
