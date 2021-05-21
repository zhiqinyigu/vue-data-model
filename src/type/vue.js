import Vue from 'vue';
import Type from '.';
import Model from '../model';
import { bindParent, toJSON } from '../utils';

const defaultReplacer = (_, value) => value;
const baseMixns = {
  methods: {
    toJSON(replacer) {
      return toJSON(this, replacer);
    },
    $assign(data, replacer = defaultReplacer) {
      if (data && typeof data === 'object') {
        for (var key in data) {
          if (key in this.$data) {
            this[key] = replacer(key, data[key]);
          }
        }
      }
    }
  }
};

function createStateModel(config) {
  class StateModel extends Model {
    constructor(data) {
      super(data);
    }
  }

  Object.assign(StateModel.prototype, config, {
    mixins: [baseMixns, ...(config.mixins || [])]
  });

  return StateModel;
}

export default class ModelWrapper extends Type {
  constructor(config) {
    super();
    this._model_ = createStateModel(config);
  }

  create(initialValue, parent) {
    const self = this;
    const optionsInstance = new self._model_();
    let createError;

    optionsInstance.mixins = [
      {
        beforeCreate() {
          this.__model__ = self._model_;
          optionsInstance.$vm = this;
          bindParent(this, parent);
          optionsInstance._dormancy = false;

          try {
            optionsInstance._calculateInitializeData(initialValue || {});
          } catch (e) {
            createError = e;
          }
        }
      }
    ].concat(optionsInstance.mixins);

    const vm = new Vue(optionsInstance);

    if (createError) {
      throw createError;
    }

    return vm;
  }

  is(vm) {
    return vm.__model__ === this._model_;
  }
}

export { baseMixns };
