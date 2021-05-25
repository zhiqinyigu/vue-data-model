import Vue from 'vue';

const slice = Array.prototype.slice;

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
  if (vm instanceof Vue) {
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
