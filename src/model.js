import proxy, { transmit } from './proxy';
import Type from './type';
import { calculateMixinsData } from './utils';

export default class Model {
  constructor() {
    const self = this;

    self._dormancy = true;
    self.data = {};

    self._each(function(key, dataTypes, defaultValue, isSchema) {
      proxy(
        self.data,
        dataTypes,
        key,
        isSchema ? val => (self._dormancy ? undefined : defaultValue.create(val, self.$vm)) : transmit
      );

      self.data[key] = undefined;
    });
  }

  _each(fn) {
    const dataTypes = calculateMixinsData(this.constructor.prototype);

    for (var key in dataTypes) {
      (function(defaultValue) {
        const isSchema = defaultValue instanceof Type;
        fn(key, dataTypes, defaultValue, isSchema);
      }.call(this, dataTypes[key]));
    }
  }

  _calculateInitializeData(data) {
    const self = this;
    const res = {};
    data = data || {};

    // @todo 类型检查
    self._each(function(key, _dataTypes, defaultValue, isSchema) {
      res[key] = self.data[key] = key in data ? data[key] : isSchema ? {} : defaultValue;
    });

    return res;
  }
}
