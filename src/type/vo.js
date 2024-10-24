import { typeCheckSuccess } from '../checker';
import { fail, isType } from '../utils';
import { ComplexType } from './base';
import Model, { mergeConfig } from './vue';
import { toJsonForMaybeVue } from './vue-utils';

const voPropertyNames = ['value'];
const voNonPropertyNames = [];

const simpleTypeMethods = {
  toString() {
    return this.value + '';
  },
  valueOf() {
    return this.value;
  },
};

export default class ValueObject extends ComplexType {
  constructor(name, defaultValue, config) {
    super(name);

    if (typeof config === 'undefined') {
      throw fail(
        `expected type or literal as argument 1, vue component options as argument 2, but only one was received.`
      );
    }

    const comp = Object.assign({}, config, {
      data() {
        return {
          value: defaultValue,
        };
      },
    });

    comp.methods = Object.assign(comp.methods || {}, simpleTypeMethods);

    this.context = mergeConfig(comp);

    if (isType(defaultValue)) {
      this._subType = defaultValue;
      this.propertyNames = voPropertyNames;
      this.properties = {
        value: defaultValue,
      };
    } else {
      this.propertyNames = voNonPropertyNames;
    }
  }

  describe() {
    return this.name;
  }

  resolveValue(value) {
    const defaultValue = this.context.data.value;
    const typeofForType = typeof defaultValue;

    return {
      value:
        this._subType || typeof value === typeof defaultValue || typeofForType === 'undefined' || defaultValue === null
          ? value
          : defaultValue,
    };
  }

  createNewInstance() {
    return Model.prototype.createNewInstance.apply(this, arguments);
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
