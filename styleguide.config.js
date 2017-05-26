var { guideConfig } = require("./lib");
var path = require("path");
var webpackConfig = require("./webpack.config");

module.exports = guideConfig({
  components: "test/components/test/*.js",
  sectionsPath: "test/components/test",
  skipComponentsWithoutExample: true,
  styleguideDir: "./test/styleguide",
  assetsDir: path.join(__dirname, "test", "resources", "assets"),
  template: path.join(__dirname, "test", "resources", "template.html"),
  title: "Customized Styleguide!",
  serverHost: "0.0.0.0",
  serverPort: 3036,
  webpackConfig: webpackConfig,
  formatImport: function(componentDir, componentFile) {
    return componentDir.replace(/^test\//, "awesome\/") + "/" + componentFile;
  },
  exampleWrapper: path.join(__dirname, "test", "components", "test", "test-wrapper.js"),
});
