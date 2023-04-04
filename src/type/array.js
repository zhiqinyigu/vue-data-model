import { PROXY_SET_VALUE } from '../constant';
import { getTreeNode, isScalarNode } from '../node/node-utils';
import { isCarryProxyValue, toJsonForMaybeVue } from './vue-utils';
import { fail, isArray } from '../utils';
import { ComplexType } from './base';
import VariationArray from '../VariationArray';
import { flattenTypeErrors, getContextForPath, typeCheckFailure } from '../checker';

export default class ArrayType extends ComplexType {
  constructor(name, Type) {
    super(name);
    if (!Type) {
      throw fail(`expected type as argument 1, got ${Type} instead`);
    }

    this._subType = Type;
  }

  describe() {
    return this._subType.describe() + '[]';
  }

  createNewInstance(array, bindNode) {
    const Type = this._subType;
    const res = VariationArray.clone(array, {
      created() {
        bindNode && bindNode(this);
      },
      _willChange(action, args) {
        const node = getTreeNode(this);
        const size = this.length;

        switch (action) {
          case 'splice':
            (function() {
              let [start, removeCount, ...added] = args;
              let realremoveCount = 0;
              const addedSize = added.length;

              if (typeof start === 'number') {
                removeCount = typeof removeCount === 'number' ? removeCount : Infinity;

                // 删除removeCount个数量
                for (let i = removeCount - 1; i >= 0; i--) {
                  if (start + i > size) return;

                  realremoveCount++;

                  let needCreatedNode = !(added.length >= i + 1 && isCarryProxyValue(added[i]));

                  if (needCreatedNode) {
                    node.getChildNodes()[start + i].die();
                    node.removeChildNode(start + i);
                  }
                }

                const tmpMove = {};

                // 修正后面的元素index
                for (let j = size - start - realremoveCount; j > 0; j--) {
                  let from = start + realremoveCount + j - 1;
                  let to = start + addedSize - 1 + j;

                  if (from !== to) {
                    tmpMove[to] = node.getChildNodes()[from];
                    node.removeChildNode(from);
                  }
                }

                Object.keys(tmpMove).forEach((index) => node.replaceChildNode(index, tmpMove[index]));
              }
            })();

            break;
        }
      },
      _overwriteParams(item, index, action, args) {
        const node = getTreeNode(this);
        const size = this.length;

        switch (action) {
          case 'splice':
            index += args[0] || 0;
            break;
          default:
            index += size;
        }

        if (isCarryProxyValue(item)) {
          const value = item[PROXY_SET_VALUE];
          delete item[PROXY_SET_VALUE];
          return value;
        }

        const childNode = Type.instantiate(node, `${node.subpath}/${index}`, item);
        node.replaceChildNode(index, childNode);

        return childNode.value;
      },
    });

    return res;
  }

  getSnapshot(node) {
    const childNodes = node.getChildNodes();

    return node.storedValue.map((value, index) => {
      const childNode = childNodes[index];

      return isScalarNode(childNode) ? childNode.snapshot : toJsonForMaybeVue(value);
    });
  }

  isValidSnapshot(value, context) {
    if (!isArray(value)) {
      return typeCheckFailure(context, value, 'Value is not an array');
    }

    return flattenTypeErrors(
      value.map((item, index) => this._subType.validate(item, getContextForPath(context, '' + index, this._subType)))
    );
  }
}

/**
 * 定义一个数组类型，规定子元素为Type类型
 * @param {Type} Type 类型
 * @returns ArrayType
 * @example
 * const Course = types.vue({
 *  data: {
 *    businessType: 1
 *  }
 * });
 *
 * types.array(Course);
 */
export function array(Type) {
  return new ArrayType(Type.name + '[]', Type);
}
