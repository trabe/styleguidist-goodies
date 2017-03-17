import path from "path";
import fs from "fs-extra";
import WebpackOnBuildPlugin from "on-build-webpack";
import { configureSection } from "./section";
import { compareNumber } from "./utils";
import { capitalize } from "./naming";
import glob from "glob";

const GUIDE_DIR = "_guide";
const GUIDE_INDEX = "index.md";
const GUIDE_CONFIG = "config.json";

const fetchSections = src => {
  const basePath = process.cwd();
  const sectionsBasePath = path.join(basePath, src);
  const dirs = glob.sync("**/_guide", { cwd: sectionsBasePath });
  return dirs.map(section => path.resolve(path.join(sectionsBasePath, section), ".."));
};

const extractDocSections = src => {
  const dirs = fetchSections(src);

  const sections = dirs.map(sectionPath => {
    const sectionContentPath = path.join(sectionPath, GUIDE_DIR);
    const sectionContentIndex = `${path.join(sectionContentPath, GUIDE_INDEX)}`;

    if (!fs.existsSync(sectionContentPath)) {
      return false;
    }
    const sectionConfigFilePath = `${path.join(sectionContentPath, GUIDE_CONFIG)}`;
    const section = configureSection(sectionPath, sectionConfigFilePath);

    return {
      path: sectionPath,
      name: section.name,
      content: sectionContentIndex,
      components: section.components,
      position: section.position,
    };
  }).filter(Boolean);

  return sortSectionsByPosition(sections);
};

const sortSectionsByPosition = sections => (
  sections.sort((a, b) => compareNumber(a.position, b.position))
);

const defaultGetComponentPathLine = formatImport => componentPath => {
  const name = path.basename(componentPath, ".js");
  const dir = path.dirname(componentPath);

  return `import ${capitalize(name)} from "${formatImport(dir, name)}";`;
};

const defaultGetExampleFilename = sections => componentPath => {

  const name = path.basename(componentPath, ".js");

  if (name === "index") {
    return null;
  }
  const exampleFilename = sections.map(s => {
    const files = glob.sync(`**/${name}.md`, { cwd: s.path });
    if (files.length > 0) {
      return path.join(s.path, files[0]);
    }
  }).filter(filename => Boolean(filename))[0];

  return exampleFilename;
};

const defaultWebpackConfig = (webpackConfig, assetsDir, styleguideDir, exampleWrapper) => (config, env) => {

  const loaders = webpackConfig.module.loaders.map(loader => {
    // ugly, ugly, ugly trick to prevent react-styleguidist errors...
    if (!loader.include && !loader.exclude) {
      loader.include = "node_modules";
    }

    return loader;
  });

  config.module.loaders.push(...loaders);

  if (assetsDir) {
    config.plugins.push(new WebpackOnBuildPlugin(() => {
      try {
        fs.copySync(assetsDir, styleguideDir);
      } catch (err) {
        console.error(err);
      }
    }));
  }

  if (exampleWrapper) {
    config.resolve.alias["rsg-components/Wrapper"] = exampleWrapper;
  }

  return config;
};

export const guideConfig = ({
  components = "./src/components",
  sections,
  styleguideDir = "./guide",
  assetsDir,
  serverHost = "0.0.0.0",
  serverPort = 3032,
  highlightTheme = "base16-light",
  getExampleFilename,
  getComponentPathLine,
  updateWebpackConfig,
  webpackConfig,
  formatImport,
  exampleWrapper,
  ...rest,
}) => {
  const sectionsPaths = sections ? sections : extractDocSections(components);
  return {
    ...rest,

    sections: sectionsPaths,

    styleguideDir,

    serverHost,

    serverPort,

    highlightTheme,

    getExampleFilename: getExampleFilename ? getExampleFilename : defaultGetExampleFilename(sectionsPaths),

    getComponentPathLine: getComponentPathLine ? getComponentPathLine : formatImport && defaultGetComponentPathLine(formatImport),

    updateWebpackConfig: updateWebpackConfig ? updateWebpackConfig : defaultWebpackConfig(webpackConfig, assetsDir, styleguideDir, exampleWrapper),

    assetsDir,
  }};
