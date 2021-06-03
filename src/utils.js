import Vue from 'vue';

let _Vue;

const slice = Array.prototype.slice;

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
  return slice.call(arr);
}

export function toJSON(vm, replacer) {
  return JSON.parse(JSON.stringify(pickData(vm), replacer));
}

export function calculateMixinsData(config) {
  return Object.assign(...(config.mixins || []).map(calculateMixinsData), config.data ? config.data.call(null) : {});
}

export function applyToJSON(vm) {
  if (vm instanceof getVue()) {
    return vm.$toValue ? vm.$toValue() : toJSON(vm);
  }

  return vm;
}

export function pickData(vm) {
  const res = {};

  for (var key in vm.$data) {
    const value = vm[key];
    res[key] = Array.isArray(value) ? value.map(applyToJSON) : applyToJSON(value);
  }

  return res;
}

export function bindParent(model, context) {
  model.__parent__ = context;
  return model;
}
