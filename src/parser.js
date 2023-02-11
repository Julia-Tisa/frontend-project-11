export default (content) => {
  const domParser = new DOMParser();
  const parsedContent = domParser.parseFromString(content, 'text/html');
  return parsedContent;
};
