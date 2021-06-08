import { fail } from '../utils';
import { SimpleType } from './base';

function defaultInitializer(val) {
  return val;
}

export class CoreType extends SimpleType {
  constructor(name, checker, initializer) {
    super(name);
    this.checker = checker;
    this.initializer = initializer || defaultInitializer;
  }

  describe() {
    return this.name;
  }

  createNewInstance(snapshot) {
    if (this.is(snapshot)) return this.initializer(snapshot);

    throw fail(`Value is not a ${this.name}`);
  }

  is(val) {
    return this.checker(val);
  }
}

export const string = new CoreType('string', (v) => typeof v === 'string');
export const number = new CoreType('number', (v) => typeof v === 'number');
export const boolean = new CoreType('boolean', (v) => typeof v === 'boolean');
export const nullType = new CoreType('null', (v) => v === null);
export const undefinedType = new CoreType('undefined', (v) => v === undefined);
