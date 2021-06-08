import { toArray } from '../utils';
import { baseMixns, vue } from './vue';
import { vo } from './vo';

export function getComposeRawMaterial() {
  return Object.assign({
    mixins: toArray(arguments).map((wrapper) => {
      return {
        ...wrapper._model_.prototype,
        mixins: wrapper._model_.prototype.mixins.filter((item) => item !== baseMixns),
      };
    }),
  });
}

export function compose() {
  return vue(getComposeRawMaterial(...arguments));
}
export function composeVo() {
  return vo(undefined, getComposeRawMaterial(...arguments));
}
