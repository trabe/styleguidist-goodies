export function camelize(str) {
  return str
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => (index === 0 ? letter.toLowerCase() : letter.toUpperCase()))
    .replace(/\s+/g, "");
}

export function capitalize(str) {
  return str
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/(?:^\w|[A-Z]|\b\w)/g, letter => letter.toUpperCase())
    .replace(/\s+/g, "");
}

export function dasherize(str) {
  return str
    .trim()
    .replace(/([a-z\d])([A-Z]+)/g, "$1_$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

export function underscore(str) {
  return str
    .trim()
    .replace(/([a-z\d])([A-Z]+)/g, "$1_$2")
    .replace(/[-\s]+/g, "_")
    .toLowerCase();
}
