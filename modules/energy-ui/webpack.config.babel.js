import { SourceMapDevToolPlugin, optimize } from 'webpack';

module.exports = {
  entry: __dirname + '/es6/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'energy.js'
  },
  plugins: [
    new optimize.UglifyJsPlugin(),
    new SourceMapDevToolPlugin({
      filename: 'energy.js.map'
    })
  ],
  externals: {
    'node-fetch': 'null',
    'log-update': 'null',
    'yargs': 'null',
    'energy-folders-tojson': 'null',
    'JSONStream': 'null'
  },
  module: {
    loaders: [

      { test: /\.css$/, loader: 'style!css' },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel', query: { optional: ['runtime'], stage: 0 }},
      { test: /bootstrap\/js\//, loader: 'imports?jQuery=jquery' },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,   loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,   loader: 'url?limit=10000&mimetype=application/font-woff2' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: 'url?limit=10000&mimetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: 'file' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: 'url?limit=10000&mimetype=image/svg+xml' }
    ]
  }
};
