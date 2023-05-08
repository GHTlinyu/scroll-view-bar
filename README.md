# scroll-view-bar

[![NPM version](https://img.shields.io/npm/v/scroll-view-bar.svg?style=flat)](https://npmjs.org/package/scroll-view-bar)
[![NPM downloads](http://img.shields.io/npm/dm/scroll-view-bar.svg?style=flat)](https://npmjs.org/package/scroll-view-bar)

Scroll bar with thumbnail background, similar to vscode side navigation

- Support for listening to the status of the scrollbar being generated
- Support custom scrollbar styles

![](https://raw.githubusercontent.com/GHTlinyu/images/master/img/scrollViewBar_v1.0.0.gif)

## Installation

```bash
npm install scroll-view-bar --save
```

## Usage

```jsx | pure
import ScrollViewBar from 'scroll-view-bar';

export default () => (
  <ScrollViewBar style={{height:300}} trigger={'滚动导航'} delay={0}>
    <div>content<div>
  </ScrollViewBar>
);
```

## API

| Property   | Type                                                                                      | Default           | Description                                                                 |
| ---------- | ----------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------- |
| prefixCls  | String                                                                                    | scroll-view-bar   | prefixCls of this component                                                 |
| trigger    | React.ReactNode                                                                           | scroll navigation | When the mouse hovers over the hover-button, trigger the scroll bar display |
| delay      | number                                                                                    | 2000              | The delay in first loading the background image                             |
| trackWidth | number                                                                                    | 160               | scroll-track width                                                          |
| trackStyle | CSSProperties                                                                             | scroll-view-bar   | customize track style                                                       |
| thumbStyle | CSSProperties                                                                             | scroll-view-bar   | customize thumb style                                                       |
| onUpdate   | (value: {top: number;scrollTop: number;scrollHeight: number;clientHeight: number;})=>void |                   | call when scrolling                                                         |

## Development

```bash
# install dependencies
$ npm install

# develop library by docs demo
$ npm start

# build library source code
$ npm run build

# build library source code in watch mode
$ npm run build:watch

# build docs
$ npm run docs:build

# check your project for potential problems
$ npm run doctor
```

## LICENSE

MIT
