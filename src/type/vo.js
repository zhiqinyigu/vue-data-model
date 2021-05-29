import { fail } from '../utils';
import { BaseType, ComplexType } from './base';
import ModelWrapper, { createStateModel } from './vue';

export default class ValueObject extends ComplexType {
  constructor(type, config) {
    super();

    if (typeof config === 'undefined') {
      throw fail(
        `expected type or literal as argument 1, vue component options as argument 2, but only one was received.`
      );
    }

    this._model_ = createStateModel(
      Object.assign({}, config, {
        data() {
          return {
            value: type,
          };
        },
      })
    );

    this._model_.prototype.mixins.push({
      methods: {
        $toValue() {
          return isSchema ? this.value.$toValue() : this.value;
        },
      },
    });

    const isSchema = type instanceof BaseType;
    const typeofForType = typeof type;
    const _calculateInitializeData = this._model_.prototype._calculateInitializeData;

    this._model_.prototype._calculateInitializeData = function (value, ...other) {
      return _calculateInitializeData.call(
        this,
        {
          value: isSchema
            ? type.is(value)
              ? value
              : type.create(value, this)
            : typeof value === typeof type || typeofForType === 'undefined' || type === null
            ? value
            : type,
        },
        ...other
      );
    };
  }

  createNewInstance() {
    return ModelWrapper.prototype.createNewInstance.apply(this, arguments);
  }

  is(vm) {
    return ModelWrapper.prototype.is.call(this, vm);
  }
}
