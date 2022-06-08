import { resolveDep } from './dep';

export function callHookPre(vm, key, handler) {
  handler && handler[key] && handler[key].call(vm);
  callHook(vm, key);
}

export function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  const len = handlers && handlers.length;

  if (len) {
    // #7573 disable dep collection when invoking lifecycle hooks
    const { pushTarget, popTarget } = resolveDep();

    pushTarget();
    for (let i = 0; i < len; i++) {
      handlers[i].call(vm);
    }
    popTarget();
  }
}
