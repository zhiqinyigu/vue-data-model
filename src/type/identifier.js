import { SimpleType } from './base';

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

    throw new Error(`value \`${val}\` is not assignable to type: \`${this.validType}\``);
  }

  is(val) {
    return this.validType === typeof val;
  }
}
