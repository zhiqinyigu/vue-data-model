import Vue from 'vue';
import { fail, normalizeIdentifier } from '../utils';
import { toJSON } from './node-utils';
import { BaseNode } from './BaseNode';
import { IdentifierCache } from './identifier-cache';

export class ObjectNode extends BaseNode {
  constructor(complexType, parent, subpath, initialValue, environment) {
    super(complexType, parent, subpath, environment);

    const self = this;

    this._childNodes = {};
    this._initialSnapshot = initialValue;

    this.vm = new Vue({
      computed: {
        snapshot() {
          return complexType.getSnapshot(self);
        },
      },
    });

    if (!parent) {
      this.identifierCache = new IdentifierCache();
    }

    const bindNode = function bindNode(value) {
      self.storedValue = value;

      if (!value.$treenode) {
        value.$treenode = self;
        value.$toValue = toJSON;
      }
    };

    bindNode(complexType.createNewInstance(this._initialSnapshot, bindNode));

    this.identifierAttribute = complexType.identifierAttribute;
    // this._childNodes = complexType._getChilds(this);

    this.identifier = null;
    this.unnormalizedIdentifier = null;
    if (this.identifierAttribute && this._initialSnapshot) {
      let id = this._initialSnapshot[this.identifierAttribute];
      if (id === undefined) {
        // try with the actual node if not (for optional identifiers)
        // const childNode = this._childNodes[this.identifierAttribute];
        // if (childNode) {
        //   id = childNode.value;
        // }
        id = this.storedValue[this.identifierAttribute];
      }

      if (typeof id !== 'string' && typeof id !== 'number') {
        throw fail(
          `Instance identifier '${this.identifierAttribute}' for type '${this.type.name}' must be a string or a number`
        );
      }

      // normalize internal identifier to string
      this.identifier = normalizeIdentifier(id);
      this.unnormalizedIdentifier = id;
    }

    this.root.identifierCache.addNodeToCache(this);
  }

  replaceChildNode(key, node) {
    this._childNodes[key] = node;
  }

  get snapshot() {
    return this.vm.snapshot;
  }
}
