function objectHasAllPropertiesSync(object, properties) {
  for (let p of properties) {
    if (!(p in object)) {
      return false;
    }
  }
  return true;
}
exports.objectHasAllPropertiesSync = objectHasAllPropertiesSync;
