import fs from "fs-extra";

export const getJsonData = (filePath, options = {}) => {
  // catching "file does not exist" error
  try {
    return fs.readJsonSync(filePath, options);
  } catch (e) {
    return null;
  }
};

export const compareNumber = (a, b) => {
  if (a === null || a === undefined) {
    return 1;
  }
  if (b === null || b === undefined) {
    return -1;
  }
  return a - b;
};
