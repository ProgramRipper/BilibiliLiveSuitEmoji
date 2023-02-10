import TerserPlugin from 'terser-webpack-plugin'
import { BannerPlugin, Configuration } from 'webpack'
import meta from './src/meta.json'


const banner = `
// ==UserScript==
${Object.entries(meta)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return [
          ...new Set(value.map(item => `// @${key.padEnd(16, ' ')}${item}`)),
        ].join('\n')
      }
      return `// @${key.padEnd(16, ' ')}${value}`
    })
    .join('\n')}
// ==/UserScript==
/* eslint-disable */ /* spell-checker: disable */
// @[ You can find all source codes in GitHub repo ]
`

export default {
  entry: './src/index.ts',
  output: {
    filename: 'bilibili-live-suit-emoji.user.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: /==\/?UserScript==|^[ ]?@|eslint-disable|spell-checker/i,
          },
        },
        extractComments: false,
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new BannerPlugin(
      {
        banner: banner,
        raw: true,
        entryOnly: true,
      },
    ),
  ],
} as Configuration
