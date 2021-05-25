import Type from '.';
import ModelWrapper, { createStateModel } from './vue';

export default class ValueObject extends Type {
  constructor(type, config) {
    super();
    this._model_ = createStateModel(
      Object.assign({}, config, {
        data() {
          return {
            value: type,
          };
        },
        methods: {
          $toValue() {
            return this.value;
          },
        },
      })
    );

    const isSchema = type instanceof Type;
    const _calculateInitializeData = this._model_.prototype._calculateInitializeData;

    this._model_.prototype._calculateInitializeData = function (value) {
      return _calculateInitializeData.call(this, {
        value: isSchema ? (type.is(value) ? value : type.create(value)) : typeof value === typeof type ? value : type,
      });
    };
  }

  create() {
    return ModelWrapper.prototype.create.apply(this, arguments);
  }

  is(vm) {
    return ModelWrapper.prototype.is.call(this, vm);
  }
}
