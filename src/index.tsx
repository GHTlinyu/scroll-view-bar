import classNames from 'classnames';
import html2canvas from 'html2canvas';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import Track from './Track';
import getScrollBarWidth from './util/getScrollBarWidth';

export interface ScrollViewBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
  trackWidth?: number;
  trackStyle?: CSSProperties;
  thumbStyle?: CSSProperties;
  onLoading?: (loading: boolean) => void;
  trigger?: boolean;
  sideCollapseTrack?: {
    hoverButton: React.ReactNode;
    hoverButtonStyle?: React.CSSProperties;
    loading?: React.ReactNode;
  };
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
    onLoading,
    onUpdate,
    trigger = false,
    sideCollapseTrack,
    ...rest
  } = props;

  const viewRef = useRef<HTMLDivElement>(null);
  const viewWrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<{ handleScroll: () => void }>(null);

  const hoverBtnHideTimeout = useRef<NodeJS.Timeout>();
  const trackHideTimeout = useRef<NodeJS.Timeout>();

  const [scrollBarWidth, setScrollBarWidth] = useState(getScrollBarWidth());
  const [trackCanvas, setTrackCanvas] = useState<{
    loading: boolean;
    imgSrc: string;
    imageHeight: number;
  }>({ loading: false, imgSrc: '', imageHeight: 0 });
  const [hideTrack, setHideTrack] = useState(false);

  useEffect(() => {
    const fetchCanvas = async () => {
      try {
        if (typeof onLoading === 'function') {
          onLoading?.(true);
        }
        setTrackCanvas((pre) => {
          return {
            ...pre,
            loading: true,
          };
        });
        if (viewWrapperRef.current) {
          //截图
          const htmlCanvas = await html2canvas(viewWrapperRef.current);
          const ctx = htmlCanvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            //让图片模糊显示
            ctx.imageSmoothingEnabled = false;
          }
          const src64 = htmlCanvas.toDataURL();
          const imageHeight =
            (htmlCanvas.height * trackWidth) / htmlCanvas.width;
          if (typeof onLoading === 'function') {
            onLoading?.(false);
          }
          setTrackCanvas(() => {
            return {
              loading: false,
              imgSrc: src64,
              imageHeight: imageHeight,
            };
          });
        } else {
          if (typeof onLoading === 'function') {
            onLoading?.(false);
          }
          setTrackCanvas(() => {
            return {
              loading: false,
              imgSrc: '',
              imageHeight: 0,
            };
          });
        }
      } catch (error) {
        if (typeof onLoading === 'function') {
          onLoading?.(false);
        }
        setTrackCanvas(() => {
          return {
            loading: false,
            imgSrc: '',
            imageHeight: 0,
          };
        });
      }
    };
    if (typeof trigger === 'boolean' && trigger) {
      fetchCanvas();
    } else {
      setTrackCanvas({
        loading: false,
        imgSrc: '',
        imageHeight: 0,
      });
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
          sideCollapseTrack={sideCollapseTrack}
        ></Track>
      </div>
      <div
        className={`${prefixCls}-hover-button`}
        style={{
          top: '50%',
          right: 0,
          ...sideCollapseTrack?.hoverButtonStyle,
          position: 'absolute',
        }}
        onMouseEnter={() => {
          if (sideCollapseTrack) {
            if (trackHideTimeout.current) {
              clearTimeout(trackHideTimeout.current);
            }
            setHideTrack(false);
          }
        }}
        onMouseMove={() => {
          if (sideCollapseTrack) {
            if (trackHideTimeout.current) {
              clearTimeout(trackHideTimeout.current);
            }
            setHideTrack(false);
          }
        }}
        onMouseLeave={() => {
          if (sideCollapseTrack) {
            hoverBtnHideTimeout.current = setTimeout(() => {
              setHideTrack(true);
            }, 300);
          }
        }}
      >
        {sideCollapseTrack
          ? trackCanvas.loading
            ? sideCollapseTrack.loading ?? 'loading'
            : sideCollapseTrack.hoverButton
          : ''}
      </div>
    </div>
  );
};

export default ScrollViewBar;
