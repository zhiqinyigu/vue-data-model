import { fail, normalizeIdentifier } from '../utils';
import { BaseNode } from './BaseNode';
import { IdentifierCache } from './identifier-cache';

export class ObjectNode extends BaseNode {
  constructor(complexType, parent, subpath, initialValue, environment) {
    super(complexType, parent, subpath, environment);

    const self = this;

    this._initialSnapshot = initialValue;

    if (!parent) {
      this.identifierCache = new IdentifierCache();
    }

    const bindNode = function bindNode(value) {
      self.storedValue = value;
      value.$treenode = self;
    };

    bindNode(complexType.createNewInstance(this._initialSnapshot, bindNode));
    this.identifierAttribute = complexType.identifierAttribute;
    // this._childNodes = complexType._getChilds(this); // @todo

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
}
