import { fail } from '../utils';
import { SimpleType } from './base';

export default class Literal extends SimpleType {
  constructor(val) {
    super();
    this.literal = val;
  }

  createNewInstance(val) {
    const match = this.is(val);

    if (match) {
      return this.literal;
    }

    throw fail(`value \`${val}\` is not assignable to type: \`${this.literal}\``);
  }

  is(val) {
    return this.literal === val;
  }
}

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
export function literal(value) {
  return new Literal(value);
}
