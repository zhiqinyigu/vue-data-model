import Type from '.';

export default class Literal extends Type {
  constructor(val) {
    super();
    this.literal = val;
  }

  create(val) {
    const match = this.is(val);

    if (match) {
      return this.literal;
    }

    throw new Error(`value \`${val}\` is not assignable to type: \`${this.literal}\``);
  }

  is(val) {
    return this.literal === val;
  }
}
