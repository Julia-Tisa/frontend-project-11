import axios from 'axios';
import parser from './parser.js';

const createUrl = (usersUrl) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.append('disableCache', 'true');
  url.searchParams.append('url', usersUrl);
  return url.toString();
};

const goNetwork = async (urlValue, watchedState) => {
  try {
    const urlRequest = createUrl(urlValue);
    const response = await axios.get(urlRequest, { timeout: 5000 });
    const { contents } = response.data;
    const parsedContent = parser(contents);
    watchedState.urls.push(urlValue);
    watchedState.feeds.push(parsedContent.dataFeed);
    parsedContent.dataPosts.forEach((itemPost) => {
      const newPost = itemPost;
      watchedState.actualPostID += 1;
      newPost.id = watchedState.actualPostID;
      watchedState.posts.push(newPost);
    });
    watchedState.status = 'valid';
  } catch (err) {
    if (err.isParsingError) {
      watchedState.status = 'fall';
    } else {
      watchedState.status = 'networkError';
    }
  }
};
const update = (watchedState) => {
  let timerId = setTimeout(function tick() {
    watchedState.urls.forEach(async (urlValue) => {
      try {
        const urlRequest = createUrl(urlValue);
        const response = await axios.get(urlRequest, { timeout: 5000 });
        const { contents } = response.data;
        const parsedContent = parser(contents);
        parsedContent.dataPosts.forEach((itemPost) => {
          const filter = watchedState.posts.filter((post) => post.title === itemPost.title);
          if (filter.length === 0) {
            watchedState.actualPostID += 1;
            const newPost = itemPost;
            newPost.id = watchedState.actualPostID;
            watchedState.posts.push(newPost);
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

export { goNetwork, update };
