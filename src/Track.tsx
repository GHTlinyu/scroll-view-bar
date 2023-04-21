import classNames from 'classnames';
import raf from 'raf';
import React, {
  CSSProperties,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import getInnerHeight from './util/getInnerHeight';
import getScrollBarWidth from './util/getScrollBarWidth';
import getThumbHeight from './util/getThumbHeight';

export interface TrackProps {
  prefixCls?: string;
  trackWidth: number;
  trackStyle?: CSSProperties;
  thumbStyle?: CSSProperties;
  viewRef: React.RefObject<HTMLDivElement>;
  hoverBtnHideTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>;
  trackHideTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>;
  imgState: {
    loading: boolean;
    imgSrc: string;
    imageHeight: number;
  };
  sideCollapseTrace?: {
    hoverButton: React.ReactNode;
    hoverButtonStyle?: React.CSSProperties;
  };
  scrollBarWidth: number;
  onScrollBarWidthChange: React.Dispatch<React.SetStateAction<number>>;
  hideTrack: boolean;
  onHideTrackChange: React.Dispatch<React.SetStateAction<boolean>>;
  onUpdate?: (value: {
    top: number;
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
  }) => void;
  onLoading?: (loading: boolean) => void;
}

export type TrackRef = { handleScroll: () => void };

const Track = (props: TrackProps, ref: React.Ref<TrackRef>) => {
  const {
    prefixCls,
    viewRef,
    scrollBarWidth,
    imgState,
    trackWidth,
    hideTrack,
    hoverBtnHideTimeout,
    trackHideTimeout,
    sideCollapseTrace,
    trackStyle: customTrackStyle,
    thumbStyle: customThumbStyle,
    onScrollBarWidthChange,
    onHideTrackChange,
    onUpdate,
    onLoading,
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

  const handleTrackMouseEnter = () => {
    if (hoverBtnHideTimeout.current) {
      clearTimeout(hoverBtnHideTimeout.current);
    }
    onHideTrackChange(false);
  };

  const handleTrackMouseLeave = () => {
    trackHideTimeout.current = setTimeout(() => {
      onHideTrackChange(true);
    }, 300);
  };

  const handleTrackMousemove = (e: MouseEvent) => {
    e.preventDefault();
    if (hoverBtnHideTimeout.current) {
      clearTimeout(hoverBtnHideTimeout.current);
    }
    onHideTrackChange(false);
  };

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
    if (sideCollapseTrace) {
      trackRef.current.addEventListener('mouseenter', handleTrackMouseEnter);
      trackRef.current.addEventListener('mouseleave', handleTrackMouseLeave);
      trackRef.current.addEventListener('mousemove', handleTrackMousemove);
    }

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
      trackRef.current.removeEventListener('mouseenter', handleTrackMouseEnter);
      trackRef.current.removeEventListener('mouseleave', handleTrackMouseLeave);
      trackRef.current.removeEventListener('mouseleave', handleTrackMousemove);
      trackRef.current.removeEventListener('mousemove', handleTrackMousemove);

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

      const thumbVerticalHeight = getThumbHeight(
        viewRef.current,
        imageRef.current,
      );
      const thumbVerticalY =
        (scrollTop / (scrollHeight - clientHeight)) *
        (trackVerticalHeight - thumbVerticalHeight);
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

  const thumbHeight = useMemo(() => {
    if (typeof onLoading === 'function') {
      onLoading?.(imgState.loading);
    }

    if (
      !imgState.loading &&
      imgState.imgSrc !== '' &&
      viewRef.current &&
      trackRef.current
    ) {
      const { scrollHeight } = viewRef.current;
      const { clientHeight } = trackRef.current;
      if (clientHeight >= scrollHeight) {
        return 0;
      }
      let height =
        Math.ceil((clientHeight / scrollHeight) * imgState.imageHeight) ?? 0;
      if (imgState.imageHeight === height) height = 0;
      return height;
    }
    return 0;
  }, [imgState]);

  const trackStyle: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    bottom: 0,
    top: 0,
    width: imgState.imgSrc !== '' ? (hideTrack ? 0 : trackWidth) : 0,
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
    height: thumbHeight,
    cursor: 'pointer',
    borderRadius: 'inherit',
    background: 'rgba(0,0,0,.2)',
    ...customThumbStyle,
  };

  return (
    <>
      <div
        ref={trackRef}
        className={classNames([`${prefixCls}-track`])}
        style={trackStyle}
      >
        <div ref={imageWrapperRef} style={imageWrapperStyle}>
          <img
            style={{
              width: 'inherit',
              userSelect: 'none',
            }}
            crossOrigin="anonymous"
            src={imgState.imgSrc}
            ref={imageRef}
          />
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
