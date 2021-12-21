const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { resolve, dirname, basename } = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { StatsWriterPlugin } = require('webpack-stats-plugin');

const production = 'production';
function makeIdent(name) {
  if (name.indexOf('/') !== -1) {
    name = name.substr(name.indexOf('/'));
  }

  if (name.endsWith('-app')) {
    name = name.substr(0, name.length - 4);
  }

  return name;
}

module.exports = (env, argv = {}) => {
  const root = process.cwd();
  const { name, peerDependencies, main } = require(resolve(root, 'package.json'));
  const mode = argv.mode || process.env.NODE_ENV || 'development';
  const filename = basename(main);
  const outDir = dirname(main);
  const srcFile = resolve(root, main);
  const ident = makeIdent(name);

  const cssLoader = {
    loader: 'css-loader',
    options: {
      modules: {
        localIdentName: `${ident}__[name]__[local]___[hash:base64:5]`,
      },
    },
  };

  return {
    entry: [srcFile],
    output: {
      path: resolve(__dirname, `dist/${ident}`),
      filename: 'bundle.js',
    },
    target: 'web',
    module: {
      rules: [
        {
          test: /\.m?(js|ts|tsx)$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: require.resolve('babel-loader'),
          },
        },
        {
          test: /\.css$/,
          use: [require.resolve('style-loader'), cssLoader],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [require.resolve('style-loader'), cssLoader, { loader: require.resolve('sass-loader') }],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          use: [
            {
              loader: require.resolve('file-loader'),
            },
          ],
        },
      ],
    },
    mode,
    devtool: mode === production ? 'source-map' : 'cheap-module-source-map',
    devServer: {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    performance: {
      hints: mode === production && 'warning',
    },
    externals: Object.keys(peerDependencies || {}),
    plugins: [
      new ForkTsCheckerWebpackPlugin(),
      new CleanWebpackPlugin(),
      new BundleAnalyzerPlugin({
        analyzerMode: env && env.analyze ? 'server' : 'disabled',
      }),
      new StatsWriterPlugin({
        filename: `${filename}.buildmanifest.json`,
        stats: {
          all: false,
          chunks: true,
        },
      }),
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss'],
    },
  };
};
