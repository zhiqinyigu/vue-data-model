import { toArray } from '../utils';
import { baseMixns } from './vue';

const getComposeRawMaterial = function () {
  return Object.assign({
    mixins: toArray(arguments).map((wrapper) => {
      return {
        ...wrapper._model_.prototype,
        mixins: wrapper._model_.prototype.mixins.filter((item) => item !== baseMixns),
      };
    }),
  });
};

export { getComposeRawMaterial };
