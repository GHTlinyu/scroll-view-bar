import classNames from 'classnames';
import html2canvas from 'html2canvas';
import ResizeObserver from 'rc-resize-observer';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import Track from './Track';
import getScrollBarWidth from './util/getScrollBarWidth';

type Trigger = () => boolean;

export interface ScrollViewBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
  autoHeight?: boolean;
  trackWidth?: number;
  trackStyle?: CSSProperties;
  thumbStyle?: CSSProperties;
  trackLoding?: React.ReactNode;
  trigger?: Trigger;
  onUpdate?: (value: {
    top: number;
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
  }) => void;
}

const ScrollViewBar = (props: ScrollViewBarProps) => {
  const {
    prefixCls = 'scroll-view-bar',
    autoHeight = false,
    children,
    style,
    className,
    trackWidth = 160,
    trackStyle,
    thumbStyle,
    trackLoding,
    onUpdate,
    ...rest
  } = props;

  const viewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<{ handleScroll: () => void }>(null);

  const [scrollBarWidth, setScrollBarWidth] = useState(getScrollBarWidth());
  const [trackCanvas, setTrackCanvas] = useState<{
    loading: boolean;
    imgSrc: string;
    imageHeight: number;
  }>({ loading: true, imgSrc: '', imageHeight: 0 });

  useEffect(() => {
    const fetchCanvas = async () => {
      try {
        setTrackCanvas((pre) => ({
          ...pre,
          loading: true,
        }));
        if (viewRef.current) {
          //处理dom
          // viewRef.current.style.position = 'absolute';
          // viewRef.current.style.top = '-9999px';

          const htmlCanvas = await html2canvas(viewRef.current);
          const ctx = htmlCanvas.getContext('2d');
          if (ctx) {
            //让图片模糊显示
            ctx.imageSmoothingEnabled = false;
          }
          const src64 = htmlCanvas.toDataURL();
          const imageHeight =
            (htmlCanvas.height * trackWidth) / htmlCanvas.width;
          // viewRef.current.style.position = 'absolute';
          // viewRef.current.style.top = '0px';
          //获取滚动条的高度，最小高度为30
          setTrackCanvas({
            loading: false,
            imgSrc: src64,
            imageHeight: imageHeight,
          });
        } else {
          setTrackCanvas({
            loading: false,
            imgSrc: '',
            imageHeight: 0,
          });
        }
      } catch (error) {
        setTrackCanvas({
          loading: false,
          imgSrc: '',
          imageHeight: 0,
        });
      }
    };

    fetchCanvas();
  }, [children]);

  const handleScroll = () => {
    if (trackRef.current) trackRef.current.handleScroll();
  };

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (!viewRef.current) return;
      viewRef.current.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    ...(autoHeight && { minHeight: 0, maxHeight: 300, height: 'auto' }),
    ...style,
  };

  const viewStyle: React.CSSProperties = trackCanvas.loading
    ? { position: 'absolute', top: -9999 }
    : {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'scroll',
        //隐藏原生滚动条
        marginRight: -scrollBarWidth,
        marginBottom: -scrollBarWidth,
        ...(autoHeight && {
          position: 'relative',
          top: undefined,
          left: undefined,
          right: undefined,
          bottom: undefined,
          minHeight: 0 + scrollBarWidth,
          maxHeight: 300 + scrollBarWidth,
        }),
      };

  const fakeLoadingStyle: React.CSSProperties = {
    position: 'absolute',
    background: '#fff',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...(autoHeight && { minHeight: 0, maxHeight: 300, height: 'auto' }),
    zIndex: trackCanvas.loading ? 1 : 0,
    display: trackCanvas.loading ? 'block' : 'none',
  };

  return (
    <ResizeObserver onResize={() => {}}>
      <div
        className={classNames([`${prefixCls}-container`, className])}
        style={containerStyle}
        ref={containerRef}
        {...rest}
      >
        <div
          className={classNames([`${prefixCls}-fake-loading`])}
          style={fakeLoadingStyle}
        >
          loading
        </div>
        <div
          ref={viewRef}
          className={classNames([`${prefixCls}-view`])}
          style={viewStyle}
        >
          {children}
        </div>
        <Track
          ref={trackRef}
          trackWidth={trackWidth}
          prefixCls={prefixCls}
          viewRef={viewRef}
          scrollBarWidth={scrollBarWidth}
          onScrollBarWidthChange={setScrollBarWidth}
          trackStyle={trackStyle}
          thumbStyle={thumbStyle}
          trackLoding={trackLoding}
          onUpdate={onUpdate}
          imgState={trackCanvas}
        >
          {children}
        </Track>
      </div>
    </ResizeObserver>
  );
};

export default ScrollViewBar;
