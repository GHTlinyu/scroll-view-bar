function getScrollBarWidthFromDom() {
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.width = '100px';
  tempDiv.style.height = '100px';
  tempDiv.style.top = '-9999px';
  tempDiv.style.overflow = 'scroll';
  document.body.appendChild(tempDiv);
  const barWidth = tempDiv.offsetWidth - tempDiv.clientWidth;
  document.body.removeChild(tempDiv);
  return barWidth;
}

function getPxRatio() {
  if (typeof window === 'undefined') return 1;
  return window.screen.availWidth / document.documentElement.clientWidth;
}

let scrollbarWidth: number | undefined = undefined;
let pxRatio: number = getPxRatio();

export default function getScrollBarWidth() {
  /**
   * 屏幕变动则重新计算滚动条尺寸
   */
  const newPxRatio = getPxRatio();

  if (pxRatio !== newPxRatio) {
    scrollbarWidth = getScrollBarWidthFromDom();
  }

  if (typeof scrollbarWidth === 'number') return scrollbarWidth;

  if (typeof document !== 'undefined') {
    scrollbarWidth = getScrollBarWidthFromDom();
  } else {
    scrollbarWidth = 0;
  }

  return scrollbarWidth || 0;
}
