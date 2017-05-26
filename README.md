# Styleguidist Goodies

## Description

A set of goodies to help you configure react-styleguidist.
**styleguidist-goodies** provides a custom `guideConfig` function which accepts all the styleguide config params and defines
a set of defaults for some of them.

## Installation

### 1. Install styleguidist

This library is meant to be used with react-styleguidist so install it first.
You can find the full React-Styleguidist's "Getting started" instructions
[here](https://github.com/styleguidist/react-styleguidist/blob/master/docs/GettingStarted.md),
however, if you use styleguidist-goodies to configure styleguidist you only have to follow this steps:

#### Install the dependencies

```
npm install --save-dev react-styleguidist react react-dom webpack
```

#### Add these scripts to the `package.json`:

```javascript
{
  // ...
  "scripts": {
    "styleguide-server": "styleguidist server",
    "styleguide-build": "styleguidist build"
  }
}
```

### 2. Install styleguidist-goodies

```
npm install --save-dev styleguidist-goodies
```

## Usage

Add a **`styleguide.config.js`** file to the project´s root folder.

```
var { guideConfig } = require("styleguidist-goodies");
var path = require("path");
var webpackConfig = require("./webpack-config");

module.exports = guideConfig({
  src: "./src/components",

  title: "Style guide",

  outputDir: "./styleguide",

  host: "0.0.0.0",

  port: 3032,

  exampleWrapper: path.join(__dirname, "src", "styleguide", "example-wrapper"),

  webpackConfig: webpackConfig,
});
```

### Config params

Styleguidist-goodies honors the [styliguidist config params](https://github.com/styleguidist/react-styleguidist/blob/master/docs/Configuration.md)
changing some defaults and providing some goodies:

| Param | Type | Required? | Description | Default value|
|:---|:---|:---|:---|:---|
| components | String | function | ✓ | Components glob expression or function |
| sections | Array | |  | See [sections](#sections) |
| sectionsPath | String | |  | See [sections](#sections) |
| styleguideDir | String |  | Path to the generated style guide. | `./guide` |
| serverHost | String |  | Host used by the styleguidist server. | `0.0.0.0` |
| serverPort | Number |  | Port used by the styleguidist server. | `3032` |
| highlightTheme | String |  | CodeMirror theme name to use for syntax highlighting in examples | `base16-light` |
| getExampleFilename | Function |  | Function that returns examples file path for a given component path. | See [`getExampleFilename`](#getExampleFilename) |
| getComponentPathLine | Function |  | Function that returns a component path line (name displayed under the component name). | See [`getComponentPathLine`](#getComponentPathLine) |
| updateWebpackConfig | Function |  | Function that allows you to modify Webpack config used by styleguidist. | See [`updateWebpackConfig`](#updateWebpackConfig) |
| formatImport | function | ✓* | Callback used to generate the import declaration. | See [`formatImport`](#formatImport) |
| exampleWrapper | String |  | Path to a module that defines a React component which will be used as a wrapper in the examples. |

#### sections

  Section configuration with [`react-styleguidist`](https://github.com/styleguidist/react-styleguidist) requires a precise definition of each section and its components. However, **Styleguidist-goodies** allows section definition by file structure conventions.

  Configuring sections using plain [`react-styleguidist`](https://github.com/styleguidist/react-styleguidist):

  ```javascript
  module.exports = {
    // ...
    sections: [
      {
        name: 'Buttons',
        content: 'src/components/buttons/index.md',
        components: 'src/components/buttons/*.js',
      },
    ],
  };
  ```

  With **Styleguidist-goodies**, you can specify a `sectionPath` parameter and this section structure will be defined implicitly through the file structure:

  ```
  project
  │
  └───src
  |   └───components
  |   |   └───buttons
  │   |   |   └───_guide
  │   |   |   |     index.md
  │   |   |   |     button-primary.md
  │   |   |   |     button-secondary.md
  │   |   |   |     ...
  ```

  **Styleguidist-goodies** shows sections and their components alphabetically by default, however it can be overrided using a `config.json` file.

  `_guide/config.json`

  ```
  {
    "position": 1,
    "components": "./*.js",
    "componentsOrder": ["button", "button-primary", "button-secondary"],
    "sections": [
      {
        "name": "button-components",
        "content": "/_guide/button-components.md",
        "components": "/button-components/**/*.js"
      }
    ]
  }
  ```

| Param | Type | Description | Default value |
|:---|:---|:---|:---|
| position | Integer | Section's position in the style guide, ascending order | Alphabetic |
| components | String | The list of components | `"**/*.js"` |
| componentsOrder | Array | Components' order inside the section. Components are referenced by their file names without extension | Alphabetic |
| sections | Array | List of subsections | `[]` |

#### getExampleFilename

This function returns the example file path for a given component path. By defult, components files are fetched up in `project/{components path}/{component path}/_guide/{component name}.md`.

```
const defaultGetExampleFilename = componentPath => {
  const name = path.basename(componentPath, ".js");

  if (name === "index") {
    return null;
  }

  const dir = path.dirname(componentPath);
  return path.join(dir, "_guide", `${name}.md`);
};
```

#### getComponentPathLine

This function returns the component path line (name displayed under the component name). By default, the function uses the [`formatImport`](#formatImport) function to build the component path. This
formatter outputs ES2105 imports.

As result, instead of `components/Buttons/Button.js` it prints `import Button from 'components/Button'`;

```
const defaultGetComponentPathLine = formatImport => componentPath => {
  const name = path.basename(componentPath, ".js");
  const dir = path.dirname(componentPath);

  return `import ${capitalize(name)} from "${formatImport(dir, name)}";`;
};
```

#### updateWebpackConfig

Function that allows you to further customize Webpack config for styleguidist.

To use the **Styleguidist-goodies** default `updateWebpackConfig` function, it´s necessary to define the `webpackConfig` param which must be your project webpack config.

The default function:

  * Fix a problem with node_modules inclusion
  * Copy all aseets in assetsDir in styleguideDir
  * Configure exampleWrapper alias

```
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
```

#### formatImport

Callback which will be used to generate the component path line. This param is used only in the default getExampleFilename, so it´s required only if you delegate the `getExampleFilename` on Styleguidist-goodies.

`formatImport` example:

```
formatImport: function(componentDir, componentFile) {
  return componentDir.replace(/^src\//, "my-project\/") + "/" + componentFile;
}
```

