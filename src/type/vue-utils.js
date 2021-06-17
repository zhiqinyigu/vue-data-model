import { PROXY_SET_VALUE } from '../constant';
import { getTreeNode, isScalarNode } from '../node/node-utils';
import { getVue } from '../utils';

function desStringify(val) {
  return JSON.parse(JSON.stringify(val));
}

export function isCarryProxyValue(val) {
  return val && typeof val === 'object' && PROXY_SET_VALUE in val;
}

export function stringify(val) {
  return JSON.stringify(isVue(val) ? toJsonForVue(val) : val);
}

export function isVue(vm) {
  const Vue = getVue();
  return vm instanceof Vue;
}

export function toJsonForMaybeVue(val) {
  return isVue(val) ? toJsonForVue(val) : desStringify(val);
}

export function toJsonForVue(vm, replacer) {
  return JSON.parse(JSON.stringify(pickData(vm), replacer));
}

export function calculateMixinsData(config, before) {
  before && before(config);

  return Object.assign(
    ...(config.mixins || []).map((item) => calculateMixinsData(item, before)),
    typeof config._original_data_ === 'function' ? config._original_data_.call(null) : config._original_data_ || {}
  );
}

export function pickData(vm) {
  const res = {};
  const node = getTreeNode(vm);
  const childs = node.getChildNodes();

  vm.$options._each(function(key) {
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
