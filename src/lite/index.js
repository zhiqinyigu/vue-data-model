import { getVue } from '../utils';
import { callHook, callHookPre } from './options';
import { initLifecycle, initState } from './state';

let uid = 1;

export function resolveContext(options) {
  const Vue = getVue();
  let $options = {};

  // merge options
  if (options && options._isComponent) {
    // optimize internal component instantiation
    // since dynamic options merging is pretty slow, and none of the
    // internal component options needs special treatment.
    // initInternalComponent(vm, options);
    console.error('options._isComponent');
  } else {
    $options = Vue.util.mergeOptions($options, options || {}, $options);
  }

  let { data } = $options;

  data = Object.assign({}, typeof data === 'function' ? data() : data);
  $options._dataKeys = Object.keys(data);
  $options._getData = function() {
    return { ...data };
  };

  return {
    data,
    options: $options,
  };
}

export function LiteVue(options, context, handler) {
  const vm = this;

  context = context || resolveContext(options);
  vm.$options = context.options;

  // a uid
  vm._uid = uid++;
  vm._isVue = true;

  // expose real self
  // vm._self = vm;
  initLifecycle(vm);
  callHookPre(vm, 'beforeCreate', handler);
  initState(vm, handler);
  callHookPre(vm, 'created', handler);
}

LiteVue.prototype.$destroy = function() {
  const vm = this;
  if (vm._isBeingDestroyed) {
    return;
  }
  callHook(vm, 'beforeDestroy');
  vm._isBeingDestroyed = true;

  // teardown watchers
  if (vm._watcher) {
    vm._watcher.teardown();
  }
  let i = vm._watchers.length;
  while (i--) {
    vm._watchers[i].teardown();
  }
  // remove reference from data ob
  // frozen object may not have observer.
  if (vm.__ob__) {
    vm.__ob__.vmCount--;
  }
  // call the last hook...
  vm._isDestroyed = true;

  callHook(vm, 'destroyed');
};

export function createLiteVue(options, context, handler) {
  return new LiteVue(options, context, handler);
}
