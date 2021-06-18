import { typeCheckSuccess } from '../checker';
import { fail, isType } from '../utils';
import { ComplexType } from './base';
import ModelWrapper, { createStateModel } from './vue';
import { toJsonForMaybeVue } from './vue-utils';

export default class ValueObject extends ComplexType {
  constructor(name, defaultValue, config) {
    super(name);

    const self = this;

    if (typeof config === 'undefined') {
      throw fail(
        `expected type or literal as argument 1, vue component options as argument 2, but only one was received.`
      );
    }

    this._model_ = createStateModel(
      Object.assign({}, config, {
        data() {
          return {
            value: defaultValue,
          };
        },
      })
    );

    const typeofForType = typeof defaultValue;
    const _calculateInitializeData = this._model_.prototype._calculateInitializeData;

    if (isType(defaultValue)) {
      this._subType = defaultValue;
    }

    this._model_.prototype._calculateInitializeData = function(value, ...other) {
      return _calculateInitializeData.call(
        this,
        {
          value: self._subType
            ? self._subType.create(value, self)
            : typeof value === typeof defaultValue || typeofForType === 'undefined' || defaultValue === null
            ? value
            : defaultValue,
        },
        ...other
      );
    };
  }

  describe() {
    return this.name;
  }

  createNewInstance() {
    return ModelWrapper.prototype.createNewInstance.apply(this, arguments);
  }

  getSnapshot(node) {
    return toJsonForMaybeVue(node.storedValue.value);
  }

  isValidSnapshot(value, context) {
    if (this._subType) {
      return this._subType.validate(value, context);
    }

    return typeCheckSuccess();
  }
}

/**
 * 基于一个 vue 组件定义创建一个类型，类似于`types.vue`，用于创建 _DDD_ 的 _Value Object_。唯一区别`types.vo`不需要接受 data 定义，内部将实际的值放在 value 字段下。
 * @param {any}    Type   类型对象或其它字面量，表示默认值。
 * @param {Object} config vue组件定义对象
 * @returns Vue
 */
export function vo(name, Type, config) {
  if (arguments.length < 3) {
    config = Type;
    Type = name;
    name = 'AnonymousVo';
  }

  return new ValueObject(name, Type, config);
}
