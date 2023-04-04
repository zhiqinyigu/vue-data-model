import { fail } from '../utils';

export class ReferenceCache {
  constructor() {
    this.cache = new Map();
  }

  addRef(node, identifier) {
    if (!identifier) return;

    if (!this.cache.has(identifier)) {
      this.cache.set(identifier, []);
    }

    const set = this.cache.get(identifier);
    if (set.indexOf(node) !== -1) throw fail(`Already registered`);

    set.push(node);
  }

  removeRefs(node, identifier, update) {
    const list = this.cache.get(identifier);
    if (list) {
      const index = list.indexOf(node);
      if (index !== -1) {
        list.splice(index, 1);
        update && this.updateRefs(identifier);
      }
    }
  }

  updateRefs(identifier) {
    const list = this.cache.get(identifier);
    if (list) {
      list.forEach((node) => node.value);
    }
  }
}
