import path from "path";
import glob from "glob";
import { getJsonData, compareNumber } from "./utils";

class Section {

  constructor(sectionPath, configFilePath) {
    this.sectionPath = sectionPath;
    this.configFilePath = configFilePath;
    this.sectionConfig = this.getSectionConfig();
    this.componentsPattern = this.getComponentsPattern();
    this.componentsOrder = this.getComponentsOrder();
  }

  // return the custom components for the defined section config.
  // Components can be defined by a pattern that matches all components or
  // by a function that returns an array of module paths
  get components() {
    return this.needsToConfigurateComponents() ?
      () => this.customComponents() : this.getDefaultComponents();
  }

  get sections() {
    const sections = this.sectionConfig.sections || [];
    return sections.map(s => ({
      ...s,
      components: path.join(this.sectionPath, s.components),
      content: s.content ? path.join(this.sectionPath, s.content) : null,
    }));
  }

  get position() {
    return this.sectionConfig.position;
  }

  get sectionName() {
    return this.sectionConfig.name || path.basename(this.sectionPath);
  }

  getDefaultComponents() {
    return (this.sectionConfig.components && typeof this.sectionConfig.components === "function") ?
      this.sectionConfig.components :
      path.join(this.sectionPath, this.componentsPattern);
  }

  getComponentsPattern() {
    return this.sectionConfig.components || "**/*.js";
  }

  getSectionConfig() {
    return getJsonData(this.configFilePath) || {};
  }

  getComponentsPaths() {
    return glob.sync(path.resolve(this.sectionPath, this.componentsPattern));
  }

  getComponentsOrder() {
    return this.sectionConfig.componentsOrder || [];
  }

  componentPosition(componentPath) {
    const componentName = path.basename(componentPath, ".js");
    const position = this.componentsOrder.findIndex((s) => s === componentName);
    return position > -1 ? position : null;
  }

  needsToConfigurateComponents() {
    return this.componentsOrder.length > 0;
  }

  customComponents() {
    return this.getComponentsPaths()
      .map(p => path.normalize(p)) // Added to normalize path separators on Windows
      .sort((a, b) =>
        compareNumber(this.componentPosition(a), this.componentPosition(b))
      );
  }
}

export function configureSection(sectionPath, configFilePath) {
  const section = new Section(sectionPath, configFilePath);
  return {
    name: section.sectionName,
    components: section.components,
    position: section.position,
    sections: section.sections,
  };
}
