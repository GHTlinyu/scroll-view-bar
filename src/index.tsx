import classNames from 'classnames';
import html2canvas from 'html2canvas';
import ResizeObserver from 'rc-resize-observer';
import React, {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Track from './Track';
import getScrollBarWidth from './util/getScrollBarWidth';

type Trigger = boolean;

export interface ScrollViewBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
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
    children,
    style,
    className,
    trackWidth = 160,
    trackStyle,
    thumbStyle,
    trackLoding = 'loading',
    onUpdate,
    trigger = false,
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
  }>({ loading: false, imgSrc: '', imageHeight: 0 });

  useEffect(() => {
    const fetchCanvas = async () => {
      try {
        setTrackCanvas((pre) => ({
          ...pre,
          loading: true,
        }));
        if (viewRef.current) {
          //处理dom
          viewRef.current.style.position = 'absolute';
          viewRef.current.style.bottom = 'auto';
          //截图
          const htmlCanvas = await html2canvas(viewRef.current);
          const ctx = htmlCanvas.getContext('2d');
          if (ctx) {
            //让图片模糊显示
            ctx.imageSmoothingEnabled = false;
          }
          const src64 = htmlCanvas.toDataURL();
          const imageHeight =
            (htmlCanvas.height * trackWidth) / htmlCanvas.width;

          //处理dom
          viewRef.current.style.position = 'absolute';
          viewRef.current.style.bottom = '0';
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
    if (typeof trigger === 'boolean' && trigger) {
      fetchCanvas();
    }
  }, [trigger]);

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
    ...style,
  };

  const viewStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'scroll',
    //隐藏原生滚动条
    marginRight: -scrollBarWidth,
    marginBottom: -scrollBarWidth,
  };

  const fakeLoadingStyle: React.CSSProperties = {
    position: 'absolute',
    background: '#fff',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: trackCanvas.loading ? 1 : 0,
    display: trackCanvas.loading ? 'block' : 'none',
  };

  const node = useMemo(() => {
    if (typeof trigger === 'boolean' && trigger) {
      return (
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
        ></Track>
      );
    }
    return '';
  }, [trigger, trackCanvas]);

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
          {trackLoding}
        </div>
        <div
          ref={viewRef}
          className={classNames([`${prefixCls}-view`])}
          style={viewStyle}
        >
          {children}
        </div>
        {node}
      </div>
    </ResizeObserver>
  );
};

export default ScrollViewBar;
