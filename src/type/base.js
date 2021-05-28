import { createObjectNode, createScalarNode } from '../node/create-node';

class BaseType {
  constructor() {
    ['is', 'instantiate', 'createNewInstance'].forEach((key) => {
      if (typeof this[key] !== 'function') {
        throw new Error(`Type must define "${key}" methods`);
      }
    });
  }

  create(snapshot, environment) {
    return this.instantiate(null, '', snapshot, environment).value;
  }
}

class ComplexType extends BaseType {
  constructor() {
    super();
  }

  create(snapshot = this.getDefaultSnapshot(), environment) {
    return super.create(snapshot, environment);
  }

  instantiate(parent, subpath, initialValue, environment) {
    return createObjectNode(this, parent, subpath, initialValue, environment);
  }

  getDefaultSnapshot() {}

  getValue(node) {
    return node.storedValue;
  }
}

class SimpleType extends BaseType {
  createNewInstance(snapshot) {
    return snapshot;
  }

  instantiate(parent, subpath, initialValue, environment) {
    return createScalarNode(this, parent, subpath, initialValue, environment);
  }

  getDefaultSnapshot() {}

  getValue(node) {
    return node.storedValue;
  }

  getSnapshot(node) {
    return node.storedValue;
  }
}

export { BaseType, ComplexType, SimpleType };
