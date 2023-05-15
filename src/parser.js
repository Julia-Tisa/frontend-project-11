export default (content, actualPostID, posts) => {
  const domParser = new DOMParser();
  const parsedContent = domParser.parseFromString(content, 'text/xml');
  const rss = parsedContent.querySelector('rss');
  if (!rss) {
    return rss;
  }
  const titleFeeds = parsedContent.querySelector('title');
  const descriptionFeeds = parsedContent.querySelector('description');
  const dataFeeds = {
    title: titleFeeds.textContent,
    description: descriptionFeeds.textContent,
  };
  let id = actualPostID;
  const newPosts = posts.slice(0);
  const itemsPosts = parsedContent.querySelectorAll('item');
  itemsPosts.forEach((item) => {
    const link = item.querySelector('link');
    const url = link.textContent;
    const title = item.querySelector('title');
    const description = item.querySelector('description');
    const filter = newPosts.filter((post) => post.title === title.textContent);
    if (filter.length === 0) {
      id += 1;
      const dataPosts = {
        id,
        title: title.textContent,
        description: description.textContent,
        url,
      };
      newPosts.push(dataPosts);
    }
  });
  return { dataFeeds, newPosts, id };
};
