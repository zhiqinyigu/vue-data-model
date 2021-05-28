import Vue from 'vue';

const slice = Array.prototype.slice;

export function toArray(arr) {
  return slice.call(arr);
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

export function getTreeNode(node) {
  return node.$treenode;
}

export function getParent(target, depth) {
  let parent = getTreeNode(target);

  depth = depth || 1;
  const _depth = depth;

  while (parent) {
    if (depth-- === 0) return parent.storedValue;
    parent = parent.parent;
  }

  throw new Error(
    `Failed to find the parent of ${JSON.stringify(target.$toValue ? target.$toValue() : target)} at depth ${_depth}`
  );
}
