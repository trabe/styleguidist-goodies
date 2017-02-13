import path from "path";
import glob from "glob";
import { getJsonData, compareNumber } from "./utils";

class Section {

  constructor(sectionPath, configFilePath) {
    this.sectionPath = sectionPath;
    this.configFilePath = configFilePath;
    this.componentsPattern = "**/*.js";
    this.sectionConfig = this.getSectionConfig();
    this.subsectionsOrder = this.getSubsectionsOrder();
  }

  // return the custom components for the defined section config.
  // Components can be defined by a pattern that matches all components or
  // by a function that returns an array of module paths
  get components() {
    return this.needsToConfigurateComponents() ?
      () => this.customSubsections() : path.join(this.sectionPath, this.componentsPattern);
  }

  get position() {
    return this.sectionConfig.position;
  }

  get sectionName() {
    return this.sectionConfig.name || path.basename(this.sectionPath);
  }

  getSectionConfig() {
    return getJsonData(this.configFilePath) || {};
  }

  getSubsectionsPaths() {
    return glob.sync(path.resolve(this.sectionPath, this.componentsPattern));
  }

  getSubsectionsOrder() {
    return this.sectionConfig.componentsOrder || [];
  }

  subsectionPosition(subsectionPath) {
    const subsectionName = path.basename(subsectionPath, ".js");
    const position = this.subsectionsOrder.findIndex((s) => s === subsectionName);
    return position > -1 ? position : null;
  }

  needsToConfigurateComponents() {
    return this.subsectionsOrder.length > 0;
  }

  customSubsections() {
    return this.getSubsectionsPaths()
      .map(p => path.normalize(p)) // Added to normalize path separators on Windows
      .sort((a, b) =>
        compareNumber(this.subsectionPosition(a), this.subsectionPosition(b))
      );
  }
}

export function configureSection(sectionPath, configFilePath) {
  const section = new Section(sectionPath, configFilePath);
  return {
    name: section.sectionName,
    components: section.components,
    position: section.position,
  };
}
