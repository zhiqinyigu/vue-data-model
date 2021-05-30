import Vue from 'vue';
import { fail, normalizeIdentifier } from '../utils';
import { getIdentifier, getTreeNode, isTreeNodeValue } from '../node/node-utils';
import { createScalarNode } from '../node/create-node';
import { isValidIdentifier } from './identifier';
import { SimpleType } from './base';

class StoredReference {
  identifier;
  resolvedReference;

  constructor(value, targetType) {
    this.targetType = targetType;

    if (isValidIdentifier(value)) {
      this.identifier = value;
    } else if (isTreeNodeValue(value)) {
      const targetNode = getTreeNode(value);
      if (!targetNode.identifierAttribute) throw fail(`Can only store references with a defined identifier attribute.`);
      const id = targetNode.unnormalizedIdentifier;
      if (id === null || id === undefined) {
        throw fail(`Can only store references to tree nodes with a defined identifier.`);
      }
      this.identifier = id;
    } else {
      throw fail(`Can only store references to tree nodes or identifiers, got: '${value}'`);
    }
  }

  updateResolvedReference(node) {
    const normalizedId = normalizeIdentifier(this.identifier);
    const root = node.root;
    const lastCacheModification = root.identifierCache.getLastCacheModificationPerId(normalizedId);
    if (!this.resolvedReference || this.resolvedReference.lastCacheModification !== lastCacheModification) {
      const { targetType } = this;
      // reference was initialized with the identifier of the target

      let target = root.identifierCache.resolve(targetType, normalizedId);

      if (!target) {
        target = {};
        // throw new fail(
        //   `Failed to resolve reference '${this.identifier}' to type '${this.targetType.name}' (from node: ${node.path})`
        // );
      }

      this.resolvedReference = {
        node: target,
        lastCacheModification: lastCacheModification,
      };
    }
  }
}

function createRef(initialValue, targetType, onChange) {
  const ref = new StoredReference(initialValue, targetType);

  const vm = new Vue({
    data: {
      identifier: ref.identifier,
      isMounted: false,
    },
    computed: {
      resolvedValue() {
        if (!this.isMounted) return;
        this.updateResolvedReference(this.node);
        return this.resolvedReference.node.value;
      },
    },
    watch: {
      resolvedValue: {
        handler(val) {
          onChange && onChange(val);
        },
      },
    },
    methods: {
      updateResolvedReference: ref.updateResolvedReference,
    },
  });

  vm.node = null;
  vm.resolvedReference = ref.resolvedReference;
  vm.targetType = ref.targetType;

  return vm;
}

export class IdentifierReferenceType extends SimpleType {
  targetType;

  constructor(targetType) {
    super();
    this.targetType = targetType;
  }

  isAssignableFrom(type) {
    return this.targetType.isAssignableFrom(type);
  }

  instantiate(parent, subpath, initialValue, environment) {
    const identifier = isTreeNodeValue(initialValue) ? getIdentifier(initialValue) : initialValue;
    const storedRef = createRef(initialValue, this.targetType, (val) => {
      const key = subpath.match(/([^/]+)$/)[0];
      parent.storedValue[key] = val;
    });
    const storedRefNode = createScalarNode(this, parent, subpath, storedRef, environment);
    storedRef.node = storedRefNode;
    storedRef.isMounted = true;
    this.watchTargetNodeForInvalidations(storedRefNode, identifier, undefined);
    return storedRefNode;
  }

  watchTargetNodeForInvalidations() {
    // @todo
  }

  getValue(storedRefNode) {
    if (!storedRefNode.isAlive) return undefined;
    const storedRef = storedRefNode.storedValue;
    return storedRef.resolvedValue;
  }

  getSnapshot(storedRefNode) {
    const ref = storedRefNode.storedValue;
    return ref.identifier;
  }

  is() {
    // @todo
  }
}
