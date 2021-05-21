import { toArray } from './utils';
import ArrayType from './type/array';
import Literal from './type/literal';
import ModelWrapper, { baseMixns } from './type/vue';
import Union from './type/union';

function getParent(target, depth) {
  let parent = target;

  depth = depth || 1;
  const _depth = depth;

  while (parent) {
    if (depth-- === 0) return parent;
    parent = parent.__parent__;
  }

  throw new Error(`Failed to find the parent of ${JSON.stringify(target.toJSON ? target.toJSON() : target)} at depth ${_depth}`);
}

const types = {
  /**
   * 创建一个响应式状态
   * @param {Object} config vue组件定义对象
   * @returns Vue
   */
  vue(config) {
    return new ModelWrapper(config);
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
    return new ModelWrapper(
      Object.assign({
        mixins: toArray(arguments).map(wrapper => {
          return {
            ...wrapper._model_.prototype,
            mixins: wrapper._model_.prototype.mixins.filter(item => item !== baseMixns)
          };
        })
      })
    );
  }
};

export { types, getParent };
export default ModelWrapper;
