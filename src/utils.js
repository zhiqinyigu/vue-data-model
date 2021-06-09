import Vue from 'vue';
import { BaseType } from './type';
import VariationArray from './VariationArray';

let _Vue;
const plainObjectString = Object.toString();

export const cannotDetermineSubtype = 'cannotDetermine';

export function isTypeCheckingEnabled() {
  return devMode() || (typeof process !== 'undefined' && process.env && process.env.ENABLE_TYPE_CHECK === 'true');
}

export function devMode() {
  return process.env.NODE_ENV !== 'production';
}

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

export function isArray(val) {
  return Array.isArray(val) || val instanceof VariationArray;
}

export function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  if (proto == null) return true;
  return proto.constructor && proto.constructor.toString() === plainObjectString;
}

export function isPrimitive(value, includeDate = true) {
  if (value === null || value === undefined) return true;
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    (includeDate && value instanceof Date)
  )
    return true;
  return false;
}

export function fail(message = 'Illegal state') {
  return new Error('[vue-data-model] ' + message);
}

export function isType(value) {
  return value instanceof BaseType;
}

export function logError(e) {
  console.error(e);
}
