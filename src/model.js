import proxy, { transmit } from './proxy';
import { BaseType } from './type';
import { getTreeNode } from './node/node-utils';
import { calculateMixinsData } from './type/vue-utils';

export default class Model {
  constructor() {
    const self = this;

    self._dormancy = true;
    self.data = {};
    self._each = self._each.bind(self);

    self._each(function (key, dataTypes, defaultValue, isSchema) {
      proxy(
        self.data,
        dataTypes,
        key,
        isSchema
          ? (val) => {
              if (self._dormancy) return;

              const node = getTreeNode(self.$vm);
              const childNode = defaultValue.instantiate(node, `${node.subpath}/${key}`, val);
              node.replaceChildNode(key, childNode);

              return childNode.value;
            }
          : transmit
      );

      self.data[key] = undefined;
    });
  }

  _each(fn) {
    const dataTypes = this._dataTypes || calculateMixinsData(this.constructor.prototype);

    for (var key in dataTypes) {
      const result = function (defaultValue) {
        const isSchema = defaultValue instanceof BaseType;
        return fn(key, dataTypes, defaultValue, isSchema);
      }.call(this, dataTypes[key]);

      if (result === false) break;
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
