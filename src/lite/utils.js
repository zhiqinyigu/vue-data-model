import { devMode, getVue } from '../utils';
import { resolveDep } from './dep';

export const IS_DEV = devMode();
export function noop(val) {
  return val;
}

export function isObserver(vm) {
  const { Observer } = resolveDep();
  return Observer && vm instanceof resolveDep().Observer;
}

/**
 * Check if a string starts with $ or _
 */
export function isReserved(str) {
  const c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5f;
}

export const bind = function nativeBind(fn, ctx) {
  return fn.bind(ctx);
};

export function warn() {
  return getVue().util.warn(...arguments);
}

/**
 * Check whether an object has the property.
 */
const hasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}
