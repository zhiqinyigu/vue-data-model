import { getVue, isPlainObject } from '../utils';
import { resolveDep } from './dep';
import { callHookPre } from './options';
import { bind, hasOwn, isReserved, IS_DEV, noop, warn } from './utils';

const computedWatcherOptions = { lazy: true };
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop,
};

export function proxy(target, sourceKey, key, setter) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key];
  };
  sharedPropertyDefinition.set =
    setter ||
    function proxySetter(val) {
      this[sourceKey][key] = val;
    };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function initData(vm) {
  const Vue = getVue();
  let data = vm.$options._getData();
  if (!isPlainObject(data)) {
    data = {};
    IS_DEV &&
      warn(
        'data functions should return an object:\n' +
          'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        vm
      );
  }

  vm._data = data;

  // proxy data on instance
  const keys = Object.keys(data);
  const props = vm.$options.props;
  const methods = vm.$options.methods;
  let i = keys.length;
  while (i--) {
    const key = keys[i];
    if (IS_DEV) {
      if (methods && hasOwn(methods, key)) {
        warn(`Method "${key}" has already been defined as a data property.`, vm);
      }
    }
    if (props && hasOwn(props, key)) {
      IS_DEV &&
        warn(`The data property "${key}" is already declared as a prop. ` + `Use prop default value instead.`, vm);
    } else if (!isReserved(key)) {
      proxy(vm, `_data`, key);
    }
  }
  // observe data
  Vue.observable(data);
}

function initComputed(vm, computed) {
  const { Watcher } = resolveDep();
  const watchers = (vm._computedWatchers = Object.create(null));
  // computed properties are just getters during SSR
  const isSSR = false; // isServerRendering()

  for (const key in computed) {
    const userDef = computed[key];
    const getter = typeof userDef === 'function' ? userDef : userDef.get;
    if (IS_DEV && getter == null) {
      warn(`Getter is missing for computed property "${key}".`, vm);
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions);
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    } else if (IS_DEV) {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm);
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm);
      } else if (vm.$options.methods && key in vm.$options.methods) {
        warn(`The computed property "${key}" is already defined as a method.`, vm);
      }
    }
  }
}

export function defineComputed(target, key, userDef) {
  const shouldCache = true; // !isServerRendering();
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache ? createComputedGetter(key) : createGetterInvoker(userDef);
    sharedPropertyDefinition.set = noop;
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop;
    sharedPropertyDefinition.set = userDef.set || noop;
  }
  if (IS_DEV && sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function() {
      warn(`Computed property "${key}" was assigned to but it has no setter.`, this);
    };
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter(key) {
  const { Dep } = resolveDep();

  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    }
  };
}

function createGetterInvoker(fn) {
  return function computedGetter() {
    return fn.call(this, this);
  };
}

function initMethods(vm, methods) {
  const props = vm.$options.props;
  for (const key in methods) {
    if (IS_DEV) {
      if (typeof methods[key] !== 'function') {
        warn(
          `Method "${key}" has type "${typeof methods[key]}" in the component definition. ` +
            `Did you reference the function correctly?`,
          vm
        );
      }
      if (props && hasOwn(props, key)) {
        warn(`Method "${key}" has already been defined as a prop.`, vm);
      }
      if (key in vm && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
            `Avoid defining component methods that start with _ or $.`
        );
      }
    }
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
  }
}

export function initState(vm, handler) {
  vm._watchers = [];
  const opts = vm.$options;
  if (opts.methods) initMethods(vm, opts.methods);
  initData(vm);
  callHookPre(vm, 'inited', handler);
  if (opts.computed) initComputed(vm, opts.computed);
}

export function initLifecycle(vm) {
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}
