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

/**
 * @internal
 * @hidden
 */
class EventHandler {
  constructor() {
    this.handlers = [];
  }

  get hasSubscribers() {
    return this.handlers.length > 0;
  }

  register(fn, atTheBeginning = false) {
    if (atTheBeginning) {
      this.handlers.unshift(fn);
    } else {
      this.handlers.push(fn);
    }
    return () => {
      this.unregister(fn);
    };
  }

  has(fn) {
    return this.handlers.indexOf(fn) >= 0;
  }

  unregister(fn) {
    const index = this.handlers.indexOf(fn);
    if (index >= 0) {
      this.handlers.splice(index, 1);
    }
  }

  clear() {
    this.handlers.length = 0;
  }

  emit(...args) {
    // make a copy just in case it changes
    const handlers = this.handlers.slice();
    handlers.forEach((f) => f(...args));
  }
}

export class EventHandlers {
  hasSubscribers(event) {
    const handler = this.eventHandlers && this.eventHandlers[event];
    return !!handler && handler.hasSubscribers;
  }

  register(event, fn, atTheBeginning = false) {
    if (!this.eventHandlers) {
      this.eventHandlers = {};
    }
    let handler = this.eventHandlers[event];
    if (!handler) {
      handler = this.eventHandlers[event] = new EventHandler();
    }
    return handler.register(fn, atTheBeginning);
  }

  has(event, fn) {
    const handler = this.eventHandlers && this.eventHandlers[event];
    return !!handler && handler.has(fn);
  }

  unregister(event, fn) {
    const handler = this.eventHandlers && this.eventHandlers[event];
    if (handler) {
      handler.unregister(fn);
    }
  }

  clear(event) {
    if (this.eventHandlers) {
      delete this.eventHandlers[event];
    }
  }

  clearAll() {
    this.eventHandlers = undefined;
  }

  emit(event, ...args) {
    const handler = this.eventHandlers && this.eventHandlers[event];
    if (handler) {
      handler.emit(...args);
    }
  }
}
