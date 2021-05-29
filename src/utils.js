import Vue from 'vue';

const slice = Array.prototype.slice;

export function toArray(arr) {
  return slice.call(arr);
}

export function normalizeIdentifier(str) {
  return '' + str;
}

export function toJSON(vm, replacer) {
  return JSON.parse(JSON.stringify(pickData(vm), replacer));
}

export function calculateMixinsData(config) {
  return Object.assign(...(config.mixins || []).map(calculateMixinsData), config.data ? config.data.call(null) : {});
}

export function applyToJSON(vm) {
  if (vm instanceof Vue) {
    return vm.$toValue ? vm.$toValue() : toJSON(vm);
  }

  return vm;
}

export function pickData(vm) {
  const res = {};

  for (var key in vm.$data) {
    const value = vm[key];
    res[key] = Array.isArray(value) ? value.map(applyToJSON) : applyToJSON(value);
  }

  return res;
}

export function fail(message = 'Illegal state') {
  return new Error('[vue-data-model] ' + message);
}

export function isTreeNodeValue(node) {
  return node && node.$treenode;
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
