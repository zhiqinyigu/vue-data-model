import { fail } from '../utils';
import { SimpleType } from './base';

export function isValidIdentifier(id) {
  return typeof id === 'string' || typeof id === 'number';
}

export default class Identifier extends SimpleType {
  constructor(type) {
    super();
    this.validType = type;
  }

  createNewInstance(val) {
    const match = this.is(val);

    if (match) {
      return val;
    }

    throw fail(`value \`${val}\` is not assignable to type: \`${this.validType}\``);
  }

  is(val) {
    return this.validType === typeof val;
  }
}

export const identifier = new Identifier('string');
export const identifierNumber = new Identifier('number');
