//webpack.config.js
const path = require('path');

module.exports = {
  mode: "development",
  entry: {
    main: "./bot.ts",
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: "[name]-bundle.js" // <--- Will be compiled to this single file
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    fallback: {
      "stream": false,
      "assert": false,
      "url": false,
      "https": false,
      "stream-http": false,
      "readline": false,
      "os": false,
      "crypto": false,
    }
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: [
          /\.spec.ts$/,
          /\.configFile$ /
        ],
        exclude: [path.resolve(__dirname, '')]
      }
    ]
  }
};