import { toArray } from '../utils';
import { baseMixns, vue } from './vue';
import { vo } from './vo';

export function getComposeRawMaterial() {
  return Object.assign({
    mixins: toArray(arguments).map(wrapper => {
      return {
        ...wrapper._model_.prototype,
        mixins: wrapper._model_.prototype.mixins.filter(item => item !== baseMixns)
      };
    })
  });
}

export function compose(...args) {
  const name = typeof args[0] === 'string' ? args.shift() : 'AnonymousModel(compose)';

  return vue(name, getComposeRawMaterial(...args));
}
export function composeVo(...types) {
  return vo(undefined, getComposeRawMaterial(...types));
}
