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
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },

  resolve: {
    extensions: [".js", ".json", ".css"],
  },
};
