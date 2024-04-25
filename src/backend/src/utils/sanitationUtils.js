function objectHasAllPropertiesSync(object, properties) {
  for (let p of properties) {
    if (!(p in object)) {
      return false;
    }
  }
  return true;
}
exports.objectHasAllPropertiesSync = objectHasAllPropertiesSync;

function objectHasNoOtherPropertiesButSync(object, properties) {
  for (let p in object) {
    if (!properties.include(p)) return false;
  }
  return true;
}
exports.objectHasNoOtherPropertiesButSync = objectHasNoOtherPropertiesButSync;

function trimOffAnyOtherPropertiesFromObjectSync(object, properties) {
  let cpy = object;
  for (let p in cpy) {
    if (!properties.include(p)) delete cpy[p];
  }
  return cpy;
}
exports.trimOffAnyOtherPropertiesFromObjectSync =
  trimOffAnyOtherPropertiesFromObjectSync;
