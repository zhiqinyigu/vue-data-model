import { devMode, getVue } from '../utils';

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

    // pushTarget和popTarget是vue的依赖收集相关方法，但是目前我们无法访问到它们。但一些地方我们需要申请停止依赖收集，如声明周期执行。
    // 由于vue的源代码里面做这个操作时，使用的是pushTarget()。判断的地方则是if (Dep.target) {...}。
    // 因此我们可以设置一个falsify值达到同样目的。
    let _target;
    dep.pushTarget = function pushTarget(target) {
      const { Dep } = dep;

      if (devMode()) {
        if (target) {
          throw '此pushTarget非彼pushTarget';
        }
      }

      _target = Dep.target;
      Dep.target = '';
    };

    dep.popTarget = function popTarget() {
      const { Dep } = dep;
      if (Dep.target === '') {
        Dep.target = _target;
      }
    };
  }

  return dep;
}
