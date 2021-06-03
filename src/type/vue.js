import { toJsonForVue } from './vue-utils';
import { ComplexType } from './base';
import Model from '../model';
import Identifier from './identifier';
import { getVue } from '../utils';

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
    super();
    this._model_ = createStateModel(config);
  }

  createNewInstance(initialValue, bindNode) {
    const self = this;
    const optionsInstance = new self._model_();
    let createError;

    optionsInstance.mixins = [
      {
        beforeCreate() {
          optionsInstance.$vm = this;
          this.__model__ = self._model_;
          bindNode && bindNode(this);

          optionsInstance._each(function (key, _dataTypes, defaultValue) {
            if (defaultValue instanceof Identifier) {
              self.identifierAttribute = key;
              return false;
            }
          });

          try {
            optionsInstance._dormancy = false;
            optionsInstance._calculateInitializeData(initialValue || {}, 'data');
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

  is(vm) {
    if (vm.__model__) {
      return vm.__model__ === this._model_;
    } else {
      try {
        this.create(vm);
        return true;
      } catch (e) {
        return false;
      }
    }
  }
}

export { baseMixns, createStateModel };
