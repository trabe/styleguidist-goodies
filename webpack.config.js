module.exports = {
  entry: [
    "./src/main.js",
  ],

  output: {
    path: "./dist/",
    filename: "bundle.js",
    publicPath: "/static/",
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel",
      },
    ],
  },

  resolve: {
    extensions: ["", ".js", ".json", ".css"],
  },
};
