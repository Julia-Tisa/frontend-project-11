/* eslint-disable no-param-reassign */
import onChange from 'on-change';

const render = (state, i18nInstance, elements) => {
  const renderState = (value, watchedState, i18n) => {
    if (value === 'invalid') {
      const { error } = watchedState;
      elements.input.classList.add('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
      elements.feedback.textContent = i18n.t(`${error.url.message}`);
    }
    if (value === 'valid') {
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18n.t('success');
      elements.form.reset();
    }
    if (value === 'fall') {
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
      elements.feedback.textContent = i18n.t('fall');
    }
    if (value === 'networkError') {
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
      elements.feedback.textContent = i18n.t('networkError');
    }
  };

  const renderFeeds = (watchedState) => {
    const h2 = document.createElement('h2');
    h2.classList.add('card-title', 'h4');
    h2.textContent = 'Фиды';
    elements.containerFeeds.innerHTML = '';
    elements.containerFeeds.append(h2);

    elements.ulFeeds.innerHTML = '';
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
      elements.ulFeeds.prepend(li);
    });
  };

  const renderPosts = (watchedState) => {
    elements.containerPosts.innerHTML = '';
    const h2Posts = document.createElement('h2');
    h2Posts.classList.add('card-title', 'h4');
    h2Posts.textContent = 'Посты';
    elements.containerPosts.append(h2Posts);

    elements.ulPosts.innerHTML = '';
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
      elements.ulPosts.prepend(li);
    });
  };

  const renderLinks = (watchedState) => {
    const links = document.querySelectorAll('a.fw-bold');
    links.forEach((link) => {
      link.addEventListener('click', () => {
        const { id } = link.dataset;
        link.classList.remove('fw-bold');
        link.classList.add('fw-normal', 'link-secondary');
        watchedState.uiState.viewedPosts.push(id);
      });
    });
  };

  const renderButtons = (watchedState) => {
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
      });
    });
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'status') {
      renderState(value, state, i18nInstance);
    }
    if (path === 'feeds') {
      renderFeeds(state);
    }
    if (path === 'posts') {
      renderPosts(state);
      renderLinks(state);
      renderButtons(state);
    }
  });

  return { watchedState };
};

export default render;
