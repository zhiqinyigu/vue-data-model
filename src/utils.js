export function toArray(arr) {
  return Array.prototype.slice.call(arr);
}

export function normalizeIdentifier(str) {
  return '' + str;
}

export function fail(message = 'Illegal state') {
  return new Error('[vue-data-model] ' + message);
}
