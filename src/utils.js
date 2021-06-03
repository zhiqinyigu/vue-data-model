import Vue from 'vue';

let _Vue;

export function getVue() {
  const lib = _Vue || Vue || window.Vue;
  if (!lib) {
    throw new Error(`
      "Vue-data-model" depends on Vue, window.vue was not found.
      Please use "Vue.use()" to inject Vue dependencies in your app.
      For example:

      import Vue from 'vue';
      import VDM from 'vue-data-model';
      Vue.use(VDM);
    `);
  }
  return lib;
}

export function setVue(Vue) {
  _Vue = Vue;
}

export function toArray(arr) {
  return Array.prototype.slice.call(arr);
}

export function normalizeIdentifier(str) {
  return '' + str;
}

export function fail(message = 'Illegal state') {
  return new Error('[vue-data-model] ' + message);
}

export function logError(e) {
  console.error(e);
}
