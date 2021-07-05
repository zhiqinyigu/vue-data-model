import { toJsonForVue } from './vue-utils';
import { ComplexType } from './base';
import Model from '../model';
import Identifier from './identifier';
import { devMode, getVue, isPlainObject } from '../utils';
import {
  flattenTypeErrors,
  getContextForPath,
  typeCheckFailure,
  typecheckInternal,
} from '../checker';

const defaultObjectOptions = { name: 'AnonymousModel' };
const defaultReplacer = (_, value) => value;
const baseMixns = {
  methods: {
    $assign(data, replacer = defaultReplacer) {
      if (data && typeof data === 'object') {
        for (var key in data) {
          if (key in this.$data) {
            this[key] = replacer(key, data[key]);
          }
        }
      }
    },
  },
};

function createStateModel(config) {
  class StateModel extends Model {}

  Object.assign(StateModel.prototype, config, {
    mixins: [baseMixns, ...(config.mixins || [])],
  });

  return StateModel;
}

export default class ModelWrapper extends ComplexType {
  constructor(config) {
    super(config.name || defaultObjectOptions.name);
    this._model_ = createStateModel(config);

    const properties = (this.properties = {});

    new this._model_()._each(function(key, _dataTypes, defaultValue, isSchema) {
      if (isSchema) {
        properties[key] = defaultValue;
      }
    });

    this.propertyNames = Object.keys(this.properties);
  }

  describe() {
    return (
      '{ ' +
      this.propertyNames.map((key) => key + ': ' + this.properties[key].describe()).join('; ') +
      ' }'
    );
  }

  createNewInstance(initialValue, bindNode) {
    if (devMode()) {
      typecheckInternal(this, initialValue);
    }

    const self = this;
    const optionsInstance = new self._model_();
    let createError;

    optionsInstance.mixins = [
      {
        beforeCreate() {
          optionsInstance.$vm = this;
          this.__model__ = self._model_;
          bindNode && bindNode(this);

          optionsInstance._each(function(key, _dataTypes, defaultValue) {
            if (defaultValue instanceof Identifier) {
              self.identifierAttribute = key;
              return false;
            }
          });

          try {
            optionsInstance._dormancy = false;
            optionsInstance._calculateInitializeData(initialValue, 'data');
          } catch (e) {
            createError = e;
          }
        },
        created() {
          // optionsInstance._calculateInitializeData(initialValue || {}, 'computed');
          if (this._beforeCreateData) {
            this.$assign(this._beforeCreateData);
          }
        },
      },
    ].concat(optionsInstance.mixins);

    const Vue = getVue();
    const vm = new Vue(optionsInstance);

    if (createError) {
      throw createError;
    }

    return vm;
  }

  getSnapshot(node) {
    return toJsonForVue(node.storedValue);
  }

  isValidSnapshot(snapshot, context) {
    if (!isPlainObject(snapshot)) {
      return typeCheckFailure(context, snapshot, 'Value is not a plain object');
    }

    return flattenTypeErrors(
      this.propertyNames.map((key) =>
        this.properties[key].validate(
          snapshot[key],
          getContextForPath(context, key, this.properties[key])
        )
      )
    );
  }
}

/**
 * 基于一个 vue 组件定义创建一个类型。
 * @param {Object} config vue组件定义对象
 * @returns Vue
 */
export function vue(...args) {
  const name = typeof args[0] === 'string' && args.shift();
  const config = args.shift() || {};
  return new ModelWrapper({ ...config, name: name || config.name });
}

export { baseMixns, createStateModel };
