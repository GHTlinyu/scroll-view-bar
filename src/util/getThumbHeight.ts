import getInnerHeight from './getInnerHeight';

const getThumbHeight = (view?: HTMLElement, track?: HTMLElement) => {
  if (!view || !track) return 0;
  const { scrollHeight, clientHeight } = view;
  const trackHeight = getInnerHeight(track);
  const height = Math.ceil((clientHeight / scrollHeight) * trackHeight) ?? 0;
  if (trackHeight === height) return 0;
  //获取滚动条的高度，最小高度为30
  return Math.max(height, 30);
};
export default getThumbHeight;
