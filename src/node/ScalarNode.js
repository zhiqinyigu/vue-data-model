import { BaseNode } from './BaseNode';

export class ScalarNode extends BaseNode {
  constructor(type, parent, subpath, initialValue, environment) {
    super(type, parent, subpath, environment);

    this._initialSnapshot = initialValue;

    this.storedValue = this.type.createNewInstance(this._initialSnapshot);
  }

  get snapshot() {
    return this.type.getSnapshot(this);
  }
}
