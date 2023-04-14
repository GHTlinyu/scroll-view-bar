import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import Track from './Track';
import getScrollBarWidth from './util/getScrollBarWidth';

export interface ScrollViewBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
  autoHeight?: boolean;
  trackWidth?: number;
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

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    ...(autoHeight && { minHeight: 0, maxHeight: 300, height: 'auto' }),
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

  return (
    <ResizeObserver onResize={() => {}}>
      <div
        className={classNames([`${prefixCls}-container`, className])}
        style={containerStyle}
        ref={containerRef}
        {...rest}
      >
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
        >
          {children}
        </Track>
      </div>
    </ResizeObserver>
  );
};

export default ScrollViewBar;
