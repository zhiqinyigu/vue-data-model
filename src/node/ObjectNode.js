import { fail, normalizeIdentifier } from '../utils';
import { toJSON } from './node-utils';
import { BaseNode, NodeLifeCycle } from './BaseNode';
import { IdentifierCache } from './identifier-cache';
import { ReferenceCache } from './reference-cache';
import { Hook } from './hook';

export class ObjectNode extends BaseNode {
  constructor(complexType, parent, subpath, initialValue, environment) {
    super(complexType, parent, subpath, environment);

    const self = this;

    this._childNodes = {};
    this._initialSnapshot = initialValue;

    // const Vue = getVue();
    // this.vm = new Vue({
    //   computed: {
    //     snapshot() {
    //       return complexType.getSnapshot(self);
    //     },
    //   },
    // });

    if (!parent) {
      this.identifierCache = new IdentifierCache();
      this.referenceCache = new ReferenceCache();
    }

    const bindNode = function bindNode(value) {
      self.storedValue = value;

      if (!value.$treenode) {
        value.$treenode = self;
        value.$toValue = toJSON;
        value.toJSON = toJSON;
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
    this.root.referenceCache.updateRefs(this.identifier);
  }

  replaceChildNode(key, node) {
    this._childNodes[key] = node;
  }

  getChildNodes() {
    return this._childNodes;
  }

  removeChildNode(key) {
    delete this._childNodes[key];
  }

  getChildren() {
    const list = this._childNodes;
    return Object.keys(list).map((key) => list[key]);
  }

  clearParent() {
    if (!this.parent) return;

    // detach if attached
    this.fireHook(Hook.beforeDetach);
    const previousState = this.state;
    this.state = NodeLifeCycle.DETACHING;

    const root = this.root;
    const newEnv = root.environment;
    const newIdCache = root.identifierCache.splitCache(this);

    try {
      this.parent.removeChild(this.subpath);
      this.baseSetParent(null, '');
      this.environment = newEnv;
      this.identifierCache = newIdCache;
    } finally {
      this.state = previousState;
    }
  }

  // setParent(newParent, subpath) {
  //   const parentChanged = newParent !== this.parent;
  //   const subpathChanged = subpath !== this.subpath;

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
  //       throw fail('assertion failed: new parent expected');
  //     }

  //     if (this.parent && parentChanged) {
  //       throw fail(
  //         `A node cannot exists twice in the state tree. Failed to add ${this} to path '${newParent.path}/${subpath}'.`
  //       );
  //     }
  //     if (!this.parent && newParent.root === this) {
  //       throw fail(
  //         `A state tree is not allowed to contain itself. Cannot assign ${this} to path '${newParent.path}/${subpath}'`
  //       );
  //     }
  //     if (!this.parent && !!this.environment && this.environment !== newParent.root.environment) {
  //       throw fail(
  //         `A state tree cannot be made part of another state tree as long as their environments are different.`
  //       );
  //     }
  //   }

  //   if (parentChanged) {
  //     // attach to new parent
  //     this.environment = undefined; // will use root's
  //     newParent.root.identifierCache.mergeCache(this);
  //     this.baseSetParent(newParent, subpath);
  //     this.fireHook(Hook.afterAttach);
  //   } else if (subpathChanged) {
  //     // moving to a new subpath on the same parent
  //     this.baseSetParent(this.parent, subpath);
  //   }
  // }

  fireHook(name) {
    this.fireInternalHook(name);

    const fn = this.storedValue && typeof this.storedValue === 'object' && this.storedValue[name];
    if (typeof fn === 'function') {
      fn.apply(this.storedValue);
    }
  }

  detach() {
    if (!this.isAlive) throw fail(`Error while detaching, node is not alive.`);
    this.clearParent();
  }

  die() {
    if (!this.isAlive || this.state === NodeLifeCycle.DETACHING) return;
    this.aboutToDie();
    this.finalizeDeath();
  }

  aboutToDie() {
    this.getChildren().forEach((node) => {
      node.aboutToDie();
    });

    // beforeDestroy should run before the disposers since else we could end up in a situation where
    // a disposer added with addDisposer at this stage (beforeDestroy) is actually never released
    this.baseAboutToDie();
  }

  finalizeDeath() {
    // invariant: not called directly but from "die"
    this.getChildren().forEach((node) => {
      node.finalizeDeath();
    });
    this.root.identifierCache.removeNodeToCache(this);
    this.root.referenceCache.updateRefs(this.identifier);
    this.baseFinalizeDeath();
  }

  // @todo 测试
  get snapshot() {
    // return this.vm.snapshot;
    return this.type.getSnapshot(this);
  }
}
