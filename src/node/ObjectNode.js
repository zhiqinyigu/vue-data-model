import { BaseNode } from './BaseNode';

export class ObjectNode extends BaseNode {
  constructor(type, parent, subpath, initialValue, environment) {
    super(type, parent, subpath, environment);

    const self = this;

    this._initialSnapshot = initialValue;

    const bindNode = function bindNode(node) {
      self.storedValue = node;
      node.$treenode = self;
    };

    bindNode(this.type.createNewInstance(this._initialSnapshot, bindNode));
  }
}
