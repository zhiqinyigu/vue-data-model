import { toArray } from '../utils';
import { vue } from './vue';
import { vo } from './vo';

export function getComposeRawMaterial() {
  return Object.assign({
    mixins: toArray(arguments).map((wrapper) => {
      const options = Object.assign({}, wrapper.context.options);
      delete options.mixins;
      delete options._dataKeys;
      return options;
    }),
  });
}

export function compose(...args) {
  const name = typeof args[0] === 'string' ? args.shift() : 'AnonymousModel(compose)';

  return vue(name, getComposeRawMaterial(...args));
}
export function composeVo(...types) {
  return vo(types[types.length - 1]._subType, getComposeRawMaterial(...types));
}
