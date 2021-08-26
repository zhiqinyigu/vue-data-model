import { setVue } from './utils';

export * from './type';
export * from './utils';
export * from './node/node-utils.js';
export * from './lite';
export * from './lite/dep';

export default {
  install: setVue,
};
