import { fail } from '../utils';
import { BaseType, ComplexType } from './base';
import ModelWrapper, { createStateModel } from './vue';
import { toJsonForMaybeVue } from './vue-utils';

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

    const isSchema = type instanceof BaseType;
    const typeofForType = typeof type;
    const _calculateInitializeData = this._model_.prototype._calculateInitializeData;

    this._model_.prototype._calculateInitializeData = function(value, ...other) {
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

  getSnapshot(node) {
    return toJsonForMaybeVue(node.storedValue.value);
  }

  is(vm) {
    return ModelWrapper.prototype.is.call(this, vm);
  }
}

/**
 * 基于一个 vue 组件定义创建一个类型，类似于`types.vue`，用于创建 _DDD_ 的 _Value Object_。唯一区别`types.vo`不需要接受 data 定义，内部将实际的值放在 value 字段下。
 * @param {any}    Type   类型对象或其它字面量，表示默认值。
 * @param {Object} config vue组件定义对象
 * @returns Vue
 */
export function vo(Type, config) {
  return new ValueObject(Type, config);
}
