import { isCarryProxyValue, toJsonForVue } from './vue-utils';
import { LiteVue, resolveContext } from '../lite';
import { ComplexType } from './base';
import Identifier from './identifier';
import { IdentifierReferenceType } from './reference';
import { devMode, isPlainObject, isType } from '../utils';
import { flattenTypeErrors, getContextForPath, typeCheckFailure, typecheckInternal } from '../checker';
import { PROXY_SET_VALUE } from '../constant';
import { getTreeNode } from '../node/node-utils';
import { proxy } from '../lite/state';

const defaultObjectOptions = { name: 'AnonymousModel' };
const defaultReplacer = (_, value) => value;

LiteVue.prototype.beforeDestroy = function() {
  this.$destroy();
};

LiteVue.prototype.$assign = function(data, replacer = defaultReplacer) {
  const keys = this.$options._dataKeys;
  if (data && typeof data === 'object') {
    for (var key in data) {
      if (keys.indexOf(key) !== -1) {
        this[key] = replacer(key, data[key]);
      }
    }
  }
};

function defineProxy(vm, Type, key) {
  proxy(vm, `_data`, key, function(val) {
    if (isCarryProxyValue(val)) {
      const value = val[PROXY_SET_VALUE];
      delete val[PROXY_SET_VALUE];
      val = value;
    } else {
      const oldVal = this[`_data`][key];
      oldVal && getTreeNode(oldVal) && getTreeNode(oldVal).die();
      val = createChildNode(this, Type, key, val).value;
    }

    this[`_data`][key] = val;
  });
}

function createChildNode(vm, Type, key, val) {
  typecheckInternal(Type, val);

  const node = getTreeNode(vm);
  const childNode = Type.instantiate(node, `${node.subpath}/${key}`, val);
  node.replaceChildNode(key, childNode);
  return childNode;
}

export function mergeConfig(config) {
  config = Object.assign({}, config);

  // const mixins = config.mixins;
  // config.mixins = [baseMixns];

  // if (mixins) {
  //   config.mixins.push.apply(config.mixins, mixins);
  // }

  return resolveContext(config);
}

export default class Model extends ComplexType {
  constructor(config) {
    super(config.name || defaultObjectOptions.name);

    const properties = (this.properties = {});

    if (config.data && typeof config.data === 'object') {
      const _data = config.data;
      config.data = function() {
        return { ..._data };
      };
    }

    const { data } = (this.context = mergeConfig(config));

    for (let key in data) {
      const defaultValue = data[key];
      if (isType(defaultValue)) {
        properties[key] = defaultValue;
        data[key] = undefined;

        if (!this.identifierAttribute && defaultValue instanceof Identifier) {
          this.identifierAttribute = key;
        }
      }
    }

    this.propertyNames = Object.keys(this.properties);
  }

  describe() {
    return '{ ' + this.propertyNames.map((key) => key + ': ' + this.properties[key].describe()).join('; ') + ' }';
  }

  resolveValue(value) {
    return value;
  }

  createNewInstance(initialValue, bindNode) {
    if (devMode()) {
      typecheckInternal(this, initialValue);
    }

    let vm;
    const self = this;
    const { context, properties, propertyNames } = this;
    const data = Object.assign({}, context.data);

    new LiteVue(
      null,
      {
        data,
        options: context.options,
      },
      {
        inited() {
          vm = this;
          bindNode && bindNode(vm);
          const data = self.resolveValue(initialValue);

          propertyNames.forEach((key) => defineProxy(vm, properties[key], key));
          vm.$options._dataKeys.forEach((key) => {
            vm[key] = key in data ? data[key] : key in properties ? undefined : context.data[key];
          });
        },
        created() {
          if (this._beforeCreateData) {
            this.$assign(this._beforeCreateData);
          }
        },
      }
    );

    return vm;
  }

  getSnapshot(node) {
    return toJsonForVue(node.storedValue);
  }

  isValidSnapshot(snapshot, context) {
    if (!isPlainObject(snapshot)) {
      return typeCheckFailure(context, snapshot, 'Value is not a plain object');
    }

    return flattenTypeErrors(
      this.propertyNames.map((key) =>
        this.properties[key].validate(snapshot[key], getContextForPath(context, key, this.properties[key]))
      )
    );
  }
}

/**
 * 基于一个 vue 组件定义创建一个类型。
 * @param {Object} config vue组件定义对象
 * @returns Model
 */
export function vue(...args) {
  const name = typeof args[0] === 'string' && args.shift();
  const config = args.shift() || {};
  return new Model(Object.assign({}, config, { name: name || config.name }));
}
