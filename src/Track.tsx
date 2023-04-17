import classNames from 'classnames';
import html2canvas from 'html2canvas';
import raf from 'raf';
import React, {
  CSSProperties,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import getInnerHeight from './util/getInnerHeight';
import getScrollBarWidth from './util/getScrollBarWidth';
import getThumbHeight from './util/getThumbHeight';

export interface TrackProps {
  prefixCls?: string;
  trackWidth: number;
  viewRef: React.RefObject<HTMLDivElement>;
  scrollBarWidth: number;
  onScrollBarWidthChange: React.Dispatch<React.SetStateAction<number>>;
  children?: React.ReactNode;
  trackStyle?: CSSProperties;
  thumbStyle?: CSSProperties;
  trackLoding?: React.ReactNode;
  onUpdate?: (value: {
    top: number;
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
  }) => void;
}

export type TrackRef = { handleScroll: () => void };

const Track = (props: TrackProps, ref: React.Ref<TrackRef>) => {
  const {
    prefixCls,
    viewRef,
    scrollBarWidth,
    onScrollBarWidthChange,
    trackWidth,
    children,
    trackStyle: customTrackStyle,
    thumbStyle: customThumbStyle,
    trackLoding = 'loading',
    onUpdate,
  } = props;

  const imageRef = useRef<HTMLImageElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const requestFrame = useRef<number>();
  const wheelRequestFrame = useRef<number>();
  //记录点击滚动条后，点击位置到上边框的距离
  const prevPageY = useRef(0);
  //记录滚动栏内部图片上边框到可视窗口的top
  const preTop = useRef(0);
  const wheelOffset = useRef(0);
  const otherRef = useRef<HTMLDivElement>(null);

  const [thumbState, setThumbState] = useState({
    thumbHeight: 0,
  });

  const [imageState, setImageState] = useState({ loading: false, src64: '' });

  const handleDrag = (event: MouseEvent) => {
    const { clientY } = event;
    let scrollTop = clientY - preTop.current - prevPageY.current;
    //转换比例
    const { clientHeight: imgClientHeight = 0 } = imageWrapperRef.current || {};
    const {
      clientHeight: viewClientHeight = 0,
      scrollHeight: viewScrollHeight = 0,
    } = viewRef.current || {};
    const { clientHeight: trackClientHeight = 0 } = trackRef.current || {};

    if (imageRef.current && trackRef.current && viewRef.current) {
      let trackVerticalHeight = 0;
      if (imgClientHeight > trackClientHeight) {
        trackVerticalHeight = getInnerHeight(trackRef.current);
      } else {
        trackVerticalHeight = getInnerHeight(imageRef.current);
      }
      const thumbVerticalHeight = getThumbHeight(
        viewRef.current,
        imageRef.current,
      );
      let viewScrollTop =
        (scrollTop / (trackVerticalHeight - thumbVerticalHeight)) *
        (viewScrollHeight - viewClientHeight);
      viewRef.current.scrollTop = viewScrollTop;
    }
  };

  const handleDragEnd = () => {
    prevPageY.current = 0;
    document.body.style.userSelect = 'auto';
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleDragEnd);
    document.onselectstart = null;
  };

  const handleThumbMouseDown = (event: MouseEvent) => {
    //阻止触发事件默认行为
    event.preventDefault();
    event.stopImmediatePropagation();
    document.body.style.userSelect = 'none';

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
    //用户开始一个新的选择时候触发
    document.onselectstart = () => false;

    if (trackRef.current) {
      const { top } = trackRef.current.getBoundingClientRect();
      preTop.current = top;
    }
    const { target, clientY } = event;
    let node = target as HTMLElement;
    if (node) {
      const { top } = node.getBoundingClientRect();
      prevPageY.current = clientY - top;
    }
  };

  const handleTrackMouseDown = (event: MouseEvent) => {
    if (!viewRef.current) return;
    event.preventDefault();
    const { target, clientY } = event;
    let node = target as HTMLElement;
    if (node) {
      const { top: targetTop } = node.getBoundingClientRect();
      //转换比例
      const { clientHeight: imgClientHeight = 0 } =
        imageWrapperRef.current || {};
      const {
        clientHeight: viewClientHeight = 0,
        scrollHeight: viewScrollHeight = 0,
      } = viewRef.current || {};
      const { clientHeight: trackClientHeight = 0 } = trackRef.current || {};

      if (imageRef.current && trackRef.current && viewRef.current) {
        let trackVerticalHeight = 0;
        if (imgClientHeight > trackClientHeight) {
          trackVerticalHeight = getInnerHeight(trackRef.current);
        } else {
          trackVerticalHeight = getInnerHeight(imageRef.current);
        }
        const thumbVerticalHeight = getThumbHeight(
          viewRef.current,
          imageRef.current,
        );
        const scrollTop =
          Math.abs(targetTop - clientY) - thumbVerticalHeight / 2;
        let viewScrollTop =
          (scrollTop / (trackVerticalHeight - thumbVerticalHeight)) *
          (viewScrollHeight - viewClientHeight);
        viewRef.current.scrollTop = viewScrollTop;
      }
    }
  };

  const handleTrackWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (wheelRequestFrame.current) raf.cancel(wheelRequestFrame.current);
    wheelRequestFrame.current = raf(() => {
      if (viewRef.current) {
        wheelOffset.current += event.deltaY;
        viewRef.current.scrollTop = wheelOffset.current;
      }
    });
  };

  useEffect(() => {
    const fetchCanvas = async () => {
      try {
        setImageState((pre) => ({ ...pre, loading: true }));
        if (otherRef.current) {
          const htmlCanvas = await html2canvas(otherRef.current);
          const ctx = htmlCanvas.getContext('2d');
          if (ctx) {
            //让图片模糊显示
            ctx.imageSmoothingEnabled = false;
          }
          const src64 = htmlCanvas.toDataURL();
          setImageState({ loading: false, src64 });
          const imageHeight =
            (htmlCanvas.height * trackWidth) / htmlCanvas.width;
          if (viewRef.current) {
            const { scrollHeight, clientHeight } = viewRef.current;
            const height =
              Math.ceil((clientHeight / scrollHeight) * imageHeight) ?? 0;
            if (imageHeight === height) return 0;
            //获取滚动条的高度，最小高度为30
            setThumbState((pre) => ({
              ...pre,
              thumbHeight: Math.max(height, 30),
            }));
          }

          //删除other节点
          if (otherRef.current.hasChildNodes()) {
            // otherRef.current.innerHTML = '';
          }
        } else {
          setImageState({ loading: false, src64: '' });
        }
      } catch (error) {
        setImageState({ loading: false, src64: '' });
      }
    };
    //初始化
    //获取滚动条高度
    fetchCanvas();
  }, [children]);

  useEffect(() => {
    //获取浏览器默认滚动栏宽度
    const freshScrollbarWidth = getScrollBarWidth();
    if (scrollBarWidth !== freshScrollbarWidth) {
      onScrollBarWidthChange(freshScrollbarWidth);
    }

    if (
      typeof document === 'undefined' ||
      !thumbRef.current ||
      !trackRef.current
    )
      return;
    thumbRef.current.addEventListener('mousedown', handleThumbMouseDown);
    trackRef.current.addEventListener('mousedown', handleTrackMouseDown);
    trackRef.current.addEventListener('wheel', handleTrackWheel);

    return () => {
      if (
        typeof document === 'undefined' ||
        !thumbRef.current ||
        !trackRef.current
      )
        return;
      thumbRef.current.removeEventListener('mousedown', handleThumbMouseDown);
      trackRef.current.removeEventListener('mousedown', handleTrackMouseDown);
      trackRef.current.removeEventListener('wheel', handleTrackWheel);

      if (requestFrame.current) {
        raf.cancel(requestFrame.current);
      }
      if (wheelRequestFrame.current) raf.cancel(wheelRequestFrame.current);
    };
  }, []);

  const _update = () => {
    const {
      scrollHeight = 0,
      clientHeight = 0,
      scrollTop = 0,
    } = viewRef.current || {};
    const { clientHeight: imgClientHeight = 0 } = imageWrapperRef.current || {};
    const { clientHeight: trackClientHeight = 0 } = trackRef.current || {};
    //imageWrapper scroll
    if (
      scrollBarWidth &&
      imageWrapperRef.current &&
      viewRef.current &&
      trackRef.current &&
      imgClientHeight > trackClientHeight
    ) {
      const imageScrollTop =
        (scrollTop * (imgClientHeight - trackClientHeight)) /
        (scrollHeight - clientHeight);
      imageWrapperRef.current.style.transform = `translateY(${-imageScrollTop}px)`;
    }
    //thumb translateY
    if (
      scrollBarWidth &&
      imageRef.current &&
      trackRef.current &&
      viewRef.current
    ) {
      //为鼠标滚动赋起始值
      wheelOffset.current = scrollTop;
      let trackVerticalHeight = 0;
      //判断
      if (imgClientHeight > trackClientHeight) {
        trackVerticalHeight = getInnerHeight(trackRef.current);
      } else {
        trackVerticalHeight = getInnerHeight(imageRef.current);
      }

      const thumbHeight = getThumbHeight(viewRef.current, imageRef.current);
      const thumbVerticalY =
        (scrollTop / (scrollHeight - clientHeight)) *
        (trackVerticalHeight - thumbHeight);
      if (thumbRef.current) {
        thumbRef.current.style.transform = `translateY(${thumbVerticalY}px)`;
      }
    }
    if (onUpdate) {
      const value = {
        top: scrollTop / (scrollHeight - clientHeight) || 0,
        scrollHeight,
        clientHeight,
        scrollTop,
      };
      onUpdate(value);
    }
  };

  const handleScroll = () => {
    if (requestFrame.current) raf.cancel(requestFrame.current);
    requestFrame.current = raf(() => {
      requestFrame.current = undefined;
      _update();
    });
  };

  useImperativeHandle(ref, () => ({ handleScroll }), []);

  const trackStyle: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 1,
    top: 0,
    width: trackWidth,
    overflow: 'hidden',
    background: '#fff',
    ...customTrackStyle,
  };

  const imageWrapperStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    width: trackWidth,
  };

  const thumbStyle: React.CSSProperties = {
    position: 'relative',
    display: 'block',
    height: thumbState.thumbHeight,
    cursor: 'pointer',
    borderRadius: 'inherit',
    background: 'rgba(0,0,0,.2)',
    ...customThumbStyle,
  };

  return (
    <>
      <div ref={otherRef} style={{ position: 'fixed', top: -9999 }}>
        {children}
      </div>
      <div
        ref={trackRef}
        className={classNames([`${prefixCls}-track`])}
        style={trackStyle}
      >
        <div ref={imageWrapperRef} style={imageWrapperStyle}>
          {imageState.loading ? (
            trackLoding
          ) : imageState.src64 !== '' ? (
            <img
              style={{
                width: 'inherit',
                userSelect: 'none',
              }}
              crossOrigin="anonymous"
              src={imageState.src64}
              ref={imageRef}
            />
          ) : (
            ''
          )}
        </div>
        <div
          ref={thumbRef}
          className={`${prefixCls}-thumb`}
          style={thumbStyle}
        ></div>
      </div>
    </>
  );
};

export default React.forwardRef<TrackRef, TrackProps>(Track);
