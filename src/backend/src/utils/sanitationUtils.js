function objectHasAllPropertiesSync(object, properties) {
  for (let p in properties) {
    if (!(p in object)) return false;
  }
  return true;
}
exports.objectHasAllPropertiesSync = objectHasAllPropertiesSync;
