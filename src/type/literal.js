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
