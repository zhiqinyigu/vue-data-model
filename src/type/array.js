import Type from '.';
import VariationArray from '../VariationArray';
import { bindParent } from '../utils';

export default class ArrayType extends Type {
  constructor(Type) {
    super();
    if (!Type) {
      throw new Error(`expected type as argument 1, got ${Type} instead`);
    }

    this.type = Type;
  }

  create(array, parent) {
    const Type = this.type;
    const res = VariationArray.clone(array, {
      _overwriteParams(item) {
        return Type.create(item, this);
      }
    });

    bindParent(res, parent);

    return res;
  }

  is(val) {
    return val instanceof VariationArray && !!val._overwriteParams;
  }
}
