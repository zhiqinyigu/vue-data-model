import proxy, { transmit } from './proxy';
import { BaseType } from './type';
import { calculateMixinsData, getTreeNode } from './utils';

export default class Model {
  constructor() {
    const self = this;

    self._dormancy = true;
    self.data = {};

    self._each(function (key, dataTypes, defaultValue, isSchema) {
      proxy(
        self.data,
        dataTypes,
        key,
        isSchema
          ? (val) =>
              self._dormancy
                ? undefined
                : defaultValue.instantiate(getTreeNode(self.$vm), `${getTreeNode(self.$vm).subpath}/${key}`, val).value
          : transmit
      );

      self.data[key] = undefined;
    });
  }

  _each(fn) {
    const dataTypes = calculateMixinsData(this.constructor.prototype);

    for (var key in dataTypes) {
      (function (defaultValue) {
        const isSchema = defaultValue instanceof BaseType;
        fn(key, dataTypes, defaultValue, isSchema);
      }.call(this, dataTypes[key]));
    }
  }

  _calculateInitializeData(data, syncSet) {
    const self = this;
    const res = {};
    data = data || {};

    // @todo 类型检查
    self._each(function (key, _dataTypes, defaultValue, isSchema) {
      res[key] = key in data ? data[key] : isSchema ? {} : defaultValue;

      if (syncSet) {
        self.data[key] = res[key];
      }
    });

    return res;
  }
}
