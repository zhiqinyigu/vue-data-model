const NodeLifeCycle = {
  DEAD: 0,
  FINALIZED: 1,
};

let _uid = 1;

export class BaseNode {
  state = 0;
  storedValue = undefined; // usually the same type as the value, but not always (such as with references)

  constructor(type, parent, subpath, environment) {
    this._id = _uid++;
    this.type = type;
    this.environment = environment;
    this.setParent(parent, subpath);
    this.state = NodeLifeCycle.FINALIZED;
  }

  get isAlive() {
    return this.state !== NodeLifeCycle.DEAD;
  }

  get root() {
    const parent = this.parent;
    return parent ? parent.root : this;
  }

  get value() {
    return this.type.getValue(this);
  }

  setParent(parent, subpath) {
    this.parent = parent;
    this.subpath = subpath;
  }

  _destroy() {
    this.state = NodeLifeCycle.DEAD;
  }
}
