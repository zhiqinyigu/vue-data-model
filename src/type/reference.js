import { PROXY_SET_VALUE } from '../constant';
import { fail, getVue, logError, normalizeIdentifier } from '../utils';
import { getIdentifier, getTreeNode, isScalarNode, isTreeNodeValue } from '../node/node-utils';
import { stringify } from './vue-utils';
import { isValidIdentifier } from './identifier';
import { SimpleType } from './base';
import { createScalarNode } from '../node/create-node';

export class StoredReference {
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
        logError(fail(`Can only store references to tree nodes with a defined identifier.`));
      }
      this.identifier = id;
    } else {
      logError(fail(`Can only store references to tree nodes or identifiers, got: '${stringify(value)}'`));
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
  const Vue = getVue();

  const vm = new Vue({
    data: {
      isMounted: false,
    },
    computed: {
      ref() {
        return ref;
      },
      resolvedValue() {
        if (!this.isMounted) return;
        ref.updateResolvedReference(this.node);
        const { value } = ref.resolvedReference.node;

        onChange && onChange(value);
        return value;
      },
    },
    watch: {
      resolvedValue() {},
    },
  });

  vm.node = null;

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
    const identifier = isTreeNodeValue(initialValue)
      ? getIdentifier(initialValue)
      : isScalarNode(initialValue)
      ? initialValue.identifier
      : initialValue;
    let lastVal;
    const storedRef = createRef(identifier, this.targetType, (val) => {
      const key = subpath.match(/([^/]+)$/)[0];
      const parentStoredValue = parent.storedValue;

      if (lastVal !== val) {
        lastVal = val;
        if (parentStoredValue[key] !== val) {
          if (val) {
            val[PROXY_SET_VALUE] = val;
          } else {
            storedRefNode[PROXY_SET_VALUE] = val;
            val = storedRefNode;
          }

          if (key in parentStoredValue) {
            if (parentStoredValue instanceof Array) {
              parentStoredValue.splice(+key, 1, val);
            } else {
              parentStoredValue[key] = val;
            }
          } else {
            parentStoredValue._beforeCreateData = parentStoredValue._beforeCreateData || {};
            parentStoredValue._beforeCreateData[key] = val;
          }
        }
      }
    });
    const storedRefNode = createScalarNode(this, parent, subpath, storedRef, environment);
    storedRefNode.identifier = identifier;
    storedRef.node = storedRefNode;
    storedRef.isMounted = true;
    this.watchTargetNodeForInvalidations(storedRefNode, identifier, parent);
    return storedRefNode;
  }

  // @todo
  watchTargetNodeForInvalidations(storedRefNode, identifier, parent) {
    storedRefNode.root.referenceCache.addRef(storedRefNode, identifier);
    const _destroy = storedRefNode._destroy;
    storedRefNode._destroy = function() {
      _destroy.apply(this, arguments);
      parent.root.referenceCache.removeRefs(this, identifier);
    };
  }

  getValue(storedRefNode) {
    if (!storedRefNode.isAlive) return undefined;
    const storedRef = storedRefNode.storedValue;
    return storedRef.resolvedValue;
  }

  getSnapshot(storedRefNode) {
    const storedRef = storedRefNode.storedValue;
    return storedRef.ref.identifier;
  }

  is() {
    // @todo
  }
}

export function reference(subType) {
  return new IdentifierReferenceType(subType);
}
