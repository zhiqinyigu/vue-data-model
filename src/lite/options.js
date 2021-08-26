import { resolveDep } from './dep';

export function callHookPre(vm, key, handler) {
  handler && handler[key] && handler[key].call(vm);
  callHook(vm, key);
}

export function callHook(vm, hook) {
  // #7573 disable dep collection when invoking lifecycle hooks
  const { pushTarget, popTarget } = resolveDep();

  pushTarget();
  const handlers = vm.$options[hook];
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(vm);
    }
  }
  popTarget();
}
