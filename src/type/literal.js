import { typeCheckFailure, typecheckInternal, typeCheckSuccess } from '../checker';
import { isPrimitive } from '../utils';
import { SimpleType } from './base';

export default class Literal extends SimpleType {
  constructor(val) {
    super(JSON.stringify(val));
    this.literal = val;
  }

  describe() {
    return JSON.stringify(this.literal);
  }

  createNewInstance(val) {
    typecheckInternal(this, val);

    return this.literal;
  }

  isValidSnapshot(value, context) {
    if (isPrimitive(value) && value === this.literal) {
      return typeCheckSuccess();
    }
    return typeCheckFailure(context, value, `Value is not a literal ${JSON.stringify(this.value)}`);
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
