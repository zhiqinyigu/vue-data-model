import { BaseNode } from './BaseNode';

export class ObjectNode extends BaseNode {
  constructor(complexType, parent, subpath, initialValue, environment) {
    super(complexType, parent, subpath, environment);

    const self = this;

    this._initialSnapshot = initialValue;

    const bindNode = function bindNode(value) {
      self.storedValue = value;
      value.$treenode = self;
    };

    bindNode(complexType.createNewInstance(this._initialSnapshot, bindNode));
    // this._childNodes = complexType.initializeChildNodes(this, this._initialSnapshot);
  }
}
