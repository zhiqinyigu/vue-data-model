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
    `Failed to find the parent of ${JSON.stringify(
      target.$toValue ? target.$toValue() : target
    )} at depth ${_depth}`
  );
}
