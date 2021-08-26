import { BaseNode, NodeLifeCycle } from './BaseNode';

export class ScalarNode extends BaseNode {
  constructor(type, parent, subpath, initialValue, environment) {
    super(type, parent, subpath, environment);

    this._initialSnapshot = initialValue;

    this.storedValue = this.type.createNewInstance(this._initialSnapshot);
  }

  get snapshot() {
    return this.type.getSnapshot(this);
  }

  // setParent(newParent, subpath) {
  //   const parentChanged = this.parent !== newParent;
  //   const subpathChanged = this.subpath !== subpath;

  //   if (!parentChanged && !subpathChanged) {
  //     return;
  //   }

  //   if (devMode()) {
  //     if (!subpath) {
  //       // istanbul ignore next
  //       throw fail('assertion failed: subpath expected');
  //     }
  //     if (!newParent) {
  //       // istanbul ignore next
  //       throw fail('assertion failed: parent expected');
  //     }
  //     if (parentChanged) {
  //       // istanbul ignore next
  //       throw fail('assertion failed: scalar nodes cannot change their parent');
  //     }
  //   }

  //   this.environment = undefined; // use parent's
  //   this.baseSetParent(this.parent, subpath);
  // }

  die() {
    if (!this.isAlive || this.state === NodeLifeCycle.DETACHING) return;
    this.aboutToDie();
    this.finalizeDeath();
  }

  aboutToDie() {
    this.baseAboutToDie();
  }

  finalizeDeath() {
    this.baseFinalizeDeath();
  }

  fireHook(name) {
    this.fireInternalHook(name);
  }
}
