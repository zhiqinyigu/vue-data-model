import { flattenTypeErrors, typeCheckFailure, typeCheckSuccess } from '../checker';
import { fail, isType } from '../utils';
import { ComplexType } from './base';

export default class Union extends ComplexType {
  _eager = true;
  constructor(name, _types) {
    super(name);
    this._types = _types;
  }

  describe() {
    return '(' + this._types.map(factory => factory.describe()).join(' | ') + ')';
  }

  instantiate(parent, subpath, initialValue, environment) {
    const type = this.determineType(initialValue, undefined);
    if (!type) throw fail('No matching type for union ' + this.describe());
    return type.instantiate(parent, subpath, initialValue, environment);
  }

  determineType(value, reconcileCurrentType) {
    if (reconcileCurrentType) {
      if (reconcileCurrentType.is(value)) {
        return reconcileCurrentType;
      }
      return this._types.filter(t => t !== reconcileCurrentType).find(type => type.is(value));
    } else {
      return this._types.find(type => type.is(value));
    }
  }

  getSnapshot(node) {
    return node.type.getSnapshot(node);
  }

  isAssignableFrom(type) {
    return this._types.some(subType => subType.isAssignableFrom(type));
  }

  isValidSnapshot(value, context) {
    const allErrors = [];
    let applicableTypes = 0;

    for (let i = 0; i < this._types.length; i++) {
      const type = this._types[i];
      const errors = type.validate(value, context);
      if (errors.length === 0) {
        if (this._eager) return typeCheckSuccess();
        else applicableTypes++;
      } else {
        allErrors.push(errors);
      }
    }

    if (applicableTypes === 1) return typeCheckSuccess();
    return typeCheckFailure(context, value, 'No type is applicable for the union').concat(flattenTypeErrors(allErrors));
  }
}

export function union(name, ...list) {
  const types = isType(name) ? [name].concat(list) : list;

  if (isType(name)) {
    name = '(' + types.map(type => type.name).join(' | ') + ')';
  }

  return new Union(name, types);
}
