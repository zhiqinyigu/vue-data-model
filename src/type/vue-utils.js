import { PROXY_SET_VALUE } from '../constant';
import { isObserver } from '../lite/utils';
import { getTreeNode, isScalarNode } from '../node/node-utils';

function desStringify(val) {
  return val === null || typeof val === 'undefined' ? val : JSON.parse(JSON.stringify(val));
}

export function isCarryProxyValue(val) {
  return val && typeof val === 'object' && PROXY_SET_VALUE in val;
}

export function stringify(val) {
  return JSON.stringify(isObserver(val) ? toJsonForVue(val) : val);
}

export function toJsonForMaybeVue(val) {
  return isObserver(val) ? toJsonForVue(val) : desStringify(val);
}

export function toJsonForVue(vm, replacer) {
  return JSON.parse(JSON.stringify(pickData(vm), replacer));
}

function pickData(vm) {
  const keys = vm.$options._dataKeys;
  const node = getTreeNode(vm);
  const childs = node.getChildNodes();

  return keys.reduce(function(acc, key) {
    let val;
    const value = vm[key];

    if (key in childs) {
      const childNode = childs[key];

      if (isScalarNode(childNode)) {
        val = childNode.snapshot;
      } else {
        val = value.$toValue();
      }
    } else {
      val = value;
    }
    acc[key] = val;
    return acc;
  }, {});
}
