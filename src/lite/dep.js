import { getVue } from '../utils';

const dep = {
  Watcher: null,
  watch: null,
  Dep: null,
  Observer: null,
  pushTarget: null,
  popTarget: null,
};

export function resolveDep() {
  if (!dep.Watcher) {
    const Vue = getVue();
    let demo = new Vue({
      data: {
        obj: {},
      },
      computed: {
        c() {
          return 1;
        },
      },
    });

    dep.Watcher = demo._computedWatchers.c.constructor;
    dep.watch = function(vm, expOrFn, cb, options) {
      return demo.$watch.call(vm, expOrFn, cb, options);
    };
    dep.Dep = demo.obj.__ob__.dep.constructor;
    dep.Observer = demo.$data.__ob__.constructor;

    let _target;
    const targetStack = [];

    dep.pushTarget = function pushTarget(target) {
      const { Dep } = dep;

      if (!targetStack.length) {
        _target = Dep.target;
      }

      targetStack.push(target);
      Dep.target = target;
    };

    dep.popTarget = function popTarget() {
      const { Dep } = dep;
      targetStack.pop();
      Dep.target = targetStack.length ? targetStack[targetStack.length - 1] : _target;
    };
  }

  return dep;
}
