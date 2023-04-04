import { EventHandlers } from '../utils';
import { Hook } from './hook';

export const NodeLifeCycle = {
  DEAD: 0,
  FINALIZED: 1,
  DETACHING: 2,
};

let _uid = 1;

export class BaseNode {
  state = 0;
  storedValue = undefined; // usually the same type as the value, but not always (such as with references)

  constructor(type, parent, subpath, environment) {
    this._id = _uid++;
    this.type = type;
    this.environment = environment;
    this.baseSetParent(parent, subpath);
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

  get isRoot() {
    return this.parent === null;
  }

  fireInternalHook(name) {
    if (this._hookSubscribers) {
      this._hookSubscribers.emit(name, this, name);
    }
  }

  registerHook(hook, hookHandler) {
    if (!this._hookSubscribers) {
      this._hookSubscribers = new EventHandlers();
    }
    return this._hookSubscribers.register(hook, hookHandler);
  }

  baseSetParent(parent, subpath) {
    this.parent = parent;
    this.subpath = subpath;
  }

  baseFinalizeDeath() {
    if (this._hookSubscribers) {
      this._hookSubscribers.clearAll();
    }

    this.baseSetParent(null, '');
    this.state = NodeLifeCycle.DEAD;
  }

  baseAboutToDie() {
    this.fireHook(Hook.beforeDestroy);
  }
}
