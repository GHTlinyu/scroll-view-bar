import { defineConfig } from 'dumi';
import path from 'path';

export default defineConfig({
  alias: {
    'scroll-view-bar$': path.resolve('src'),
  },
  outputPath: 'docs-dist',
  mfsu: false,
  favicons: ['https://avatars0.githubusercontent.com/u/9441414?s=200&v=4'],
  themeConfig: {
    logo: 'https://avatars0.githubusercontent.com/u/9441414?s=200&v=4',
    name: 'scroll-view-bar',
  },
});
