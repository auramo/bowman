const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')
const { v4: uuidv4 } = require('uuid')

const lastCommit = process.env.SOURCE_VERSION || 'N/A'
const versionString = lastCommit + '_' + new Date().toISOString()

module.exports = (env, argv) => {
  const mode = argv.mode || 'production'

  return {
    mode,
    entry: './webapp/main.tsx',
    output: {
      filename: `bundle-[contenthash].js`,
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
      clean: true
    },
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.webapp.json'
            }
          }
        },
        {
          test: /\.less$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({ filename: 'styles-[contenthash].css' }),
      new HtmlWebpackPlugin({ template: './web-resources/index.html' }),
      new webpack.DefinePlugin({
        __SYSTEM_VERSION__: `"${versionString}"`,
        __BUST__: `"${uuidv4()}"`
      })
    ]
  }
}
