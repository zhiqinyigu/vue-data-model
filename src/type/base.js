import { fail } from '../utils';
import { typeCheckFailure, typeCheckSuccess } from '../checker';
import { createObjectNode, createScalarNode } from '../node/create-node';
import { getTreeNodeSafe, getType } from '../node/node-utils';

const abstractBaseMethods = [/* 'isValidSnapshot', */ 'instantiate'];

class BaseType {
  identifierAttribute;

  constructor(name) {
    this.name = name;

    abstractBaseMethods.forEach(key => {
      if (typeof this[key] !== 'function') {
        throw fail(`BaseType must realize "${key}" methods`);
      }
    });
  }

  create(snapshot, environment) {
    return this.instantiate(null, '', snapshot, environment).value;
  }

  isAssignableFrom(type) {
    return type === this;
  }

  validate(value, context) {
    const node = getTreeNodeSafe(value);
    if (node) {
      const valueType = getType(value);
      return this.isAssignableFrom(valueType) ? typeCheckSuccess() : typeCheckFailure(context, value);
    }
    return this.isValidSnapshot(value, context);
  }

  is(thing) {
    return this.validate(thing, [{ path: '', type: this }]).length === 0;
  }
}

class ComplexType extends BaseType {
  create(snapshot = this.getDefaultSnapshot(), environment) {
    return super.create(snapshot, environment);
  }

  instantiate(parent, subpath, initialValue, environment) {
    return createObjectNode(this, parent, subpath, initialValue, environment);
  }

  getDefaultSnapshot() {
    return {};
  }

  getValue(node) {
    return node.storedValue;
  }

  getSnapshot(node) {
    return JSON.parse(JSON.stringify(node.storedValue));
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
