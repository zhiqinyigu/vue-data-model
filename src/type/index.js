import { getComposeRawMaterial } from './compose';
import ArrayType from './array';
import Literal from './literal';
import ModelWrapper from './vue';
import Union from './union';
import ValueObject from './vo';
import Identifier from './identifier';
import { IdentifierReferenceType } from './reference';

export * from './base';
export * from './array';
export * from './literal';
export * from './vue';
export * from './union';
export * from './vo';
export * from './compose';

export const types = {
  /**
   * 基于一个 vue 组件定义创建一个类型。
   * @param {Object} config vue组件定义对象
   * @returns Vue
   */
  vue(config) {
    return new ModelWrapper(config);
  },

  /**
   * 基于一个 vue 组件定义创建一个类型，类似于`types.vue`，用于创建 _DDD_ 的 _Value Object_。唯一区别`types.vo`不需要接受 data 定义，内部将实际的值放在 value 字段下，并重载了`$toValue`方法。
   * @param {any}    Type   类型对象或其它字面量，表示默认值。
   * @param {Object} config vue组件定义对象
   * @returns Vue
   */
  vo(Type, config) {
    return new ValueObject(Type, config);
  },

  /**
   * 定义一个数组类型，规定子元素为Type类型
   * @param {Type} Type 类型
   * @returns ArrayType
   * @example
   * const Course = types.vue({
   *  data() {
   *    return {
   *      businessType: 1
   *    }
   *  }
   * });
   *
   * types.array(Course);
   */
  array(Type) {
    return new ArrayType(Type);
  },

  /**
   * 定义一个字面量类型，通用与types.union配合使用，或者用于强制约束数据。
   * @param {*} value 任何值
   * @returns Literal
   * @example
   * const Course = types.vue({
   *  data() {
   *    return {
   *      businessType: types.literal(1),
   *      name: ''
   *    }
   *  }
   * });
   *
   * // 一切正常
   * Course.create({
   *   businessType: 1,
   *   name: '武志红'
   * });
   *
   * // 跟定义的字面量不一样时（包括不传），将报错。
   * Course.create({
   *   businessType: 2,
   *   name: '武志红'
   * });
   */
  literal(value) {
    return new Literal(value);
  },

  union(...list) {
    return new Union(list);
  },

  compose() {
    return types.vue(getComposeRawMaterial(...arguments));
  },
  composeVo() {
    return types.vo(undefined, getComposeRawMaterial(...arguments));
  },

  identifier: new Identifier('string'),
  identifierNumber: new Identifier('number'),

  reference(subType) {
    return new IdentifierReferenceType(subType);
  },
};
