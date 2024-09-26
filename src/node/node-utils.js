import { ScalarNode } from './ScalarNode';
import { fail } from '../utils';

export function toJSON() {
  return getTreeNode(this).snapshot;
}

export function isTreeNodeValue(node) {
  return node && node.$treenode;
}

export function isScalarNode(node) {
  return node instanceof ScalarNode;
}

export function detach(target) {
  getTreeNode(target).detach();
  return target;
}

/**
 * Removes a model element from the state tree, and mark it as end-of-life; the element should not be used anymore
 */
export function destroy(target) {
  const node = getTreeNode(target);
  if (node.isRoot) node.die();
  else if (node.parent) node.parent.removeChild(node.subpath);
}

export function getTreeNode(value) {
  return value.$treenode;
}

export function getType(object) {
  return getTreeNode(object).type;
}

export function getTreeNodeSafe(value) {
  return (value && value.$treenode) || null;
}

export function getIdentifier(target) {
  return getTreeNode(target).identifier;
}

export function newChildNode(parent, childPath, item, Type) {
  let childNode = getTreeNodeSafe(item);
  if (childNode) {
    if (childNode.parent) {
      throw fail(
        'Cannot add an object to a state tree if it is already part of the same or another state tree.' /* Tried to assign an object to \'/tweets/0\', but it lives already at \'/tweets/1\' */
      );
    } else {
      childNode.baseSetParent(parent, childPath);
    }
  } else {
    childNode = Type.instantiate(parent, childPath, item);
  }

  return childNode;
}

export function getEnv(target) {
  const node = getTreeNode(target);
  const env = node.root.environment;
  if (!env) return {};
  return env;
}

export function getRoot(target) {
  let parent = getTreeNode(target);

  if (parent) {
    return parent.root.storedValue;
  }
}

export function getParent(target, depth) {
  let parent = getTreeNode(target);

  depth = depth || 1;
  const _depth = depth;

  while (parent) {
    if (depth-- === 0) return parent.storedValue;
    parent = parent.parent;
  }

  throw fail(
    `Failed to find the parent of ${JSON.stringify(target.$toValue ? target.$toValue() : target)} at depth ${_depth}`
  );
}
