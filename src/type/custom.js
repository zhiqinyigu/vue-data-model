import { typeCheckFailure, typeCheckSuccess } from '../checker';
import { createScalarNode } from '../node/create-node';
import { SimpleType } from './base';

export function custom(options) {
  return new CustomType(options);
}

export class CustomType extends SimpleType {
  constructor(options) {
    super(options.name);
  }

  describe() {
    return this.name;
  }

  isValidSnapshot(value, context) {
    if (this.options.isTargetType(value)) return typeCheckSuccess();

    const typeError = this.options.getValidationMessage(value);
    if (typeError) {
      return typeCheckFailure(context, value, `Invalid value for type '${this.name}': ${typeError}`);
    }
    return typeCheckSuccess();
  }

  getSnapshot(node) {
    return this.options.toSnapshot(node.storedValue);
  }

  instantiate(parent, subpath, initialValue, environment) {
    const valueToStore = this.options.isTargetType(initialValue)
      ? initialValue
      : this.options.fromSnapshot(initialValue, parent && parent.root.environment);
    return createScalarNode(this, parent, subpath, valueToStore, environment);
  }
}
