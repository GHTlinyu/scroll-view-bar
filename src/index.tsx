import classNames from 'classnames';
import html2canvas from 'html2canvas';
import debounce from 'lodash/debounce';
import ResizeObserver, { SizeInfo } from 'rc-resize-observer';
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Track from './Track';
import getScrollBarWidth from './util/getScrollBarWidth';

export interface ScrollViewBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
  trackWidth?: number;
  trackStyle?: CSSProperties;
  thumbStyle?: CSSProperties;
  delay?: number;
  trigger?: React.ReactNode;
  observable?: boolean;
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
    delay = 2000,
    observable = false,
    trigger = 'scroll navigation',
    onUpdate,
    ...rest
  } = props;

  const viewRef = useRef<HTMLDivElement>(null);
  const viewWrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<{ handleScroll: () => void }>(null);

  //延迟加载背景图
  const timeoutId = useRef<NodeJS.Timeout>();
  const observerRef = useRef<MutationObserver>();
  const hoverBtnHideTimeout = useRef<NodeJS.Timeout>();
  const trackHideTimeout = useRef<NodeJS.Timeout>();

  const containerSizeInfo = useRef({ width: 0, height: 0 });

  const [scrollBarWidth, setScrollBarWidth] = useState(getScrollBarWidth());
  const [trackCanvas, setTrackCanvas] = useState<{
    loading: boolean;
    imgSrc: string;
    imageHeight: number;
  }>({ loading: true, imgSrc: '', imageHeight: 0 });

  const [hideTrack, setHideTrack] = useState(true);

  const observe = useCallback((fetchC: { (): Promise<void>; (): void }) => {
    //使用观察者监视背景
    const observerConfig = {
      attributes: true,
      chidList: true,
      subtree: true,
      characterData: true,
      attributeOldValue: true,
      characterDataOldValue: true,
    };
    //使用debounce优化
    const callback = debounce(function () {
      fetchC();
    }, 500);
    // 创建一个观察器实例并传入回调函数
    observerRef.current = new MutationObserver(callback);

    // 以上述配置开始观察目标节点
    if (viewRef.current) {
      observerRef.current.observe(viewRef.current, observerConfig);
    }
  }, []);

  const fetchCanvas = async () => {
    try {
      if (viewWrapperRef.current) {
        //截图
        const htmlCanvas = await html2canvas(viewWrapperRef.current);
        const ctx = htmlCanvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          //让图片模糊显示
          ctx.imageSmoothingEnabled = false;
        }
        const src64 = htmlCanvas.toDataURL();
        const imageHeight = (htmlCanvas.height * trackWidth) / htmlCanvas.width;
        setTrackCanvas(() => {
          return {
            loading: false,
            imgSrc: src64,
            imageHeight: imageHeight,
          };
        });
      } else {
        setTrackCanvas(() => {
          return {
            loading: false,
            imgSrc: '',
            imageHeight: 0,
          };
        });
      }
    } catch (error) {
      setTrackCanvas(() => {
        return {
          loading: false,
          imgSrc: '',
          imageHeight: 0,
        };
      });
    }
  };

  const handleScroll = () => {
    if (trackRef.current) trackRef.current.handleScroll();
  };

  useEffect(() => {
    //使用延迟生成背景
    if (typeof delay === 'number') {
      timeoutId.current = setTimeout(() => {
        fetchCanvas().finally(() => {
          //延迟加载之后，使用mutationObserver监视view中节点变化，并更新背景图
          if (observable) {
            observe(fetchCanvas);
          }
        });
      }, delay);
    }
    //增加滚动事件
    if (viewRef.current) {
      viewRef.current.addEventListener('scroll', handleScroll);
    }
    //初始化sizeInfo
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      containerSizeInfo.current.height = height;
      containerSizeInfo.current.width = width;
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (!viewRef.current) return;
      viewRef.current.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleResize = ({ width, height }: SizeInfo) => {
    const freshScrollbarWidth = getScrollBarWidth();
    if (scrollBarWidth !== freshScrollbarWidth) {
      setScrollBarWidth(freshScrollbarWidth);
    }
    if (
      containerSizeInfo.current.height !== height ||
      containerSizeInfo.current.width !== width
    ) {
      fetchCanvas();
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    ...style,
  };

  const containerWrapperStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
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
  const viewWrapperStyle: React.CSSProperties = {};

  return (
    <ResizeObserver onResize={debounce(handleResize, 300)}>
      <div
        className={classNames([`${prefixCls}-container`, className])}
        ref={containerRef}
        style={containerStyle}
        {...rest}
      >
        <div
          className={classNames([`${prefixCls}-container-wrapper`])}
          style={containerWrapperStyle}
        >
          <div
            ref={viewRef}
            className={classNames([`${prefixCls}-view`])}
            style={viewStyle}
          >
            <div
              ref={viewWrapperRef}
              className={classNames([`${prefixCls}-view-wrapper`])}
              style={viewWrapperStyle}
            >
              {children}
            </div>
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
            onUpdate={onUpdate}
            imgState={trackCanvas}
            hideTrack={hideTrack}
            onHideTrackChange={setHideTrack}
            hoverBtnHideTimeout={hoverBtnHideTimeout}
            trackHideTimeout={trackHideTimeout}
          ></Track>
        </div>
        <div
          className={classNames([
            `${prefixCls}-hover-button`,
            !trackCanvas.loading ? `${prefixCls}-hover-button-active` : '',
          ])}
          style={{
            top: 0,
            right: 0,
            position: 'absolute',
            userSelect: 'none',
            cursor: trackCanvas.loading ? 'not-allowed' : 'auto',
          }}
          onMouseEnter={() => {
            if (trackHideTimeout.current) {
              clearTimeout(trackHideTimeout.current);
            }
            setHideTrack(false);
          }}
          onMouseMove={() => {
            if (trackHideTimeout.current) {
              clearTimeout(trackHideTimeout.current);
            }
            setHideTrack(false);
          }}
          onMouseLeave={() => {
            hoverBtnHideTimeout.current = setTimeout(() => {
              setHideTrack(true);
            }, 300);
          }}
        >
          {trigger}
        </div>
      </div>
    </ResizeObserver>
  );
};

export default ScrollViewBar;
