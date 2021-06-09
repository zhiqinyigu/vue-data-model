import { typeCheckFailure, typecheckInternal, typeCheckSuccess } from '../checker';
import { SimpleType } from './base';

export function isValidIdentifier(id) {
  return typeof id === 'string' || typeof id === 'number';
}

export default class Identifier extends SimpleType {
  constructor(type) {
    super('identifier');
    this.validType = type;
  }

  describe() {
    return 'identifier';
  }

  createNewInstance(val) {
    typecheckInternal(this, val);
    return val;
  }

  isValidSnapshot(value, context) {
    if (typeof value !== this.validType) {
      return typeCheckFailure(context, value, `Value is not a valid ${this.describe()}, expected a ${this.validType}`);
    }
    return typeCheckSuccess();
  }
}

export const identifier = new Identifier('string');
export const identifierNumber = new Identifier('number');
