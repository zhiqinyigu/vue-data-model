import { typeCheckSuccess } from '../checker';
import { isTreeNodeValue } from '../node/node-utils';
import { fail } from '../utils';
import { BaseType } from './base';

const undefinedAsOptionalValues = [undefined];

function checkOptionalPreconditions(defaultValueOrFunction) {
  if (typeof defaultValueOrFunction !== 'function' && isTreeNodeValue(defaultValueOrFunction)) {
    throw fail(
      'default value cannot be an instance, pass a snapshot or a function that creates an instance/snapshot instead'
    );
  }
}

export class OptionalValue extends BaseType {
  constructor(subtype, defaultValue, optionalValues) {
    super(subtype.name);
    this.subtype = subtype;
    this.defaultValue = defaultValue;
    this.optionalValues = optionalValues;
  }

  describe() {
    return this.subtype.describe() + '?';
  }

  instantiate(parent, subpath, initialValue, environment) {
    if (this.optionalValues.indexOf(initialValue) >= 0) {
      const defaultInstanceOrSnapshot = this.getDefaultInstanceOrSnapshot();
      return this.subtype.instantiate(parent, subpath, defaultInstanceOrSnapshot, environment);
    }
    return this.subtype.instantiate(parent, subpath, initialValue, environment);
  }

  getDefaultInstanceOrSnapshot() {
    const defaultInstanceOrSnapshot = typeof this.defaultValue === 'function' ? this.defaultValue() : this.defaultValue;

    return defaultInstanceOrSnapshot;
  }

  isAssignableFrom(type) {
    return this.subtype.isAssignableFrom(type);
  }

  isValidSnapshot(value, context) {
    if (this.optionalValues.indexOf(value) >= 0) {
      return typeCheckSuccess();
    }
    return this.subtype.validate(value, context);
  }

  getSubType() {
    return this.subtype;
  }
}

export function optional(type, defaultValueOrFunction, optionalValues) {
  checkOptionalPreconditions(type, defaultValueOrFunction);

  return new OptionalValue(type, defaultValueOrFunction, optionalValues ? optionalValues : undefinedAsOptionalValues);
}
