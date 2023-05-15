export default (content) => {
  const domParser = new DOMParser();
  const parsedContent = domParser.parseFromString(content, 'text/xml');
  const rss = parsedContent.querySelector('rss');
  if (!rss) {
    return rss;
  }
  const titleFeeds = parsedContent.querySelector('title');
  const descriptionFeeds = parsedContent.querySelector('description');
  const dataFeed = {
    title: titleFeeds.textContent,
    description: descriptionFeeds.textContent,
  };
  // let id = actualPostID;
  const dataPosts = [];
  const itemsPosts = parsedContent.querySelectorAll('item');
  itemsPosts.forEach((item) => {
    const link = item.querySelector('link');
    const url = link.textContent;
    const title = item.querySelector('title');
    const description = item.querySelector('description');
    /* const filter = newPosts.filter((post) => post.title === title.textContent);
    if (filter.length === 0) {
      id += 1; */
    const post = {
      title: title.textContent,
      description: description.textContent,
      url,
    };
    dataPosts.push(post);
    // }
  });
  return { dataFeed, dataPosts };
};
