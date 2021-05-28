import { getTreeNode } from '../utils';
import { ComplexType } from './base';
import VariationArray from '../VariationArray';

export default class ArrayType extends ComplexType {
  constructor(Type) {
    super();
    if (!Type) {
      throw new Error(`expected type as argument 1, got ${Type} instead`);
    }

    this._subType = Type;
  }

  createNewInstance(array, bindNode) {
    bindNode && bindNode(this);

    const self = this;
    const Type = this._subType;
    const res = VariationArray.clone(array, {
      _overwriteParams(item, index) {
        const subpath = '' + index;
        return Type.instantiate(getTreeNode(self), subpath, item).value;
      },
    });

    return res;
  }

  is(val) {
    return val instanceof VariationArray && !!val._overwriteParams;
  }
}
