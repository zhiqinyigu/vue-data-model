export class BaseNode {
  storedValue = undefined; // usually the same type as the value, but not always (such as with references)

  constructor(type, parent, subpath, environment) {
    this.type = type;
    this.environment = environment;
    this.setParent(parent, subpath);
  }

  get value() {
    return this.type.getValue(this);
  }

  setParent(parent, subpath) {
    this.parent = parent;
    this.subpath = subpath;
  }
}
