import Vue from 'vue';
import { PROXY_SET_VALUE } from '../constant';
import { getTreeNode, isScalarNode } from '../node/node-utils';

function desStringify(val) {
  return JSON.parse(JSON.stringify(val));
}

export function isCarryProxyValue (val) {
  return val && typeof val === 'object' && PROXY_SET_VALUE in val;
}

export function stringify(val) {
  return JSON.stringify(isVue(val) ? toJsonForVue(val) : val);
}

export function isVue(vm) {
  return vm instanceof Vue;
}

export function toJsonForMaybeVue(val) {
  return isVue(val) ? toJsonForVue(val) : desStringify(val);
}

export function toJsonForVue(vm, replacer) {
  return JSON.parse(JSON.stringify(pickData(vm), replacer));
}

export function calculateMixinsData(config) {
  return Object.assign(...(config.mixins || []).map(calculateMixinsData), config.data ? config.data.call(null) : {});
}

export function pickData(vm) {
  const res = {};
  const node = getTreeNode(vm);
  const childs = node.getChildNodes();

  vm.$options._each(function (key) {
    let _val;
    const value = vm[key];

    if (key in childs) {
      const childNode = childs[key];

      if (isScalarNode(childNode)) {
        _val = childNode.snapshot;
      } else {
        _val = value.$toValue();
      }
    } else {
      _val = value;
    }

    res[key] = _val;
  });

  return res;
}
