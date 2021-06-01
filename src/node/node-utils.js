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

export function getTreeNode(node) {
  return node.$treenode;
}

export function getIdentifier(target) {
  return getTreeNode(target).identifier;
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
