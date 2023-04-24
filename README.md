# scroll-view-bar

[![NPM version](https://img.shields.io/npm/v/scroll-view-bar.svg?style=flat)](https://npmjs.org/package/scroll-view-bar)
[![NPM downloads](http://img.shields.io/npm/dm/scroll-view-bar.svg?style=flat)](https://npmjs.org/package/scroll-view-bar)

Scroll bar with thumbnail background, similar to vscode side navigation

- Support for listening to the status of the scrollbar being generated,look API _onLoading_ method
- Support custom scrollbar styles
- Consider using _sidehoverbtn_ if your page render more than once.The purpose is to manually control the generation of the scroll bar

![](https://raw.githubusercontent.com/GHTlinyu/images/master/img/scrollViewBar.gif)

## Installation

```bash
npm install scroll-view-bar --save
```

## Usage

```jsx | pure
import ScrollViewBar from 'scroll-view-bar';

export default () => (
  <ScrollViewBar style={{height:300}} trigger={true}>
    <div>content<div>
  </ScrollViewBar>
);
```

## API

| Property          | Type                                                                                            | Default         | Description                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------- |
| prefixCls         | String                                                                                          | scroll-view-bar | prefixCls of this component                                                             |
| trigger           | boolean                                                                                         | false           | trigger generate track                                                                  |
| onLoading         | (loading: boolean)=>void                                                                        |                 | detecting loading                                                                       |
| trackWidth        | number                                                                                          | 160             | scroll-track width                                                                      |
| trackStyle        | CSSProperties                                                                                   | scroll-view-bar | customize track style                                                                   |
| thumbStyle        | CSSProperties                                                                                   | scroll-view-bar | customize thumb style                                                                   |
| sideCollapseTrack | {hoverButton: React.ReactNode,hoverButtonStyle?: React.CSSProperties;loading?: React.ReactNode} | undefined       | Generates a button similar to tooltip that controls whether the scroll bar is displayed |
| onUpdate          | (value: {top: number;scrollTop: number;scrollHeight: number;clientHeight: number;})=>void       |                 | call when scrolling                                                                     |

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
