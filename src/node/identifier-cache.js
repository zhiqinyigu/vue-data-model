import Vue from 'vue';
import { fail } from '../utils';

let identifierCacheId = 0;

export class IdentifierCache {
  constructor() {
    this.cacheId = identifierCacheId++;
    this.cache = new Map();
    this.lastCacheModificationPerId = new Vue({
      data: {
        sett: {},
      },
    });
  }

  updateLastCacheModificationPerId(identifier) {
    const lcm = this.lastCacheModificationPerId.sett[identifier];
    // we start at 1 since 0 means no update since cache creation
    this.lastCacheModificationPerId.sett = {
      ...this.lastCacheModificationPerId.sett,
      [identifier]: lcm === undefined ? 1 : lcm + 1,
    };
  }

  getLastCacheModificationPerId(identifier) {
    const modificationId = this.lastCacheModificationPerId.sett[identifier] || 0;
    return `${this.cacheId}-${modificationId}`;
  }

  addNodeToCache(node, lastCacheUpdate = true) {
    if (node.identifierAttribute) {
      const identifier = node.identifier;

      if (!this.cache.has(identifier)) {
        this.cache.set(identifier, []);
      }

      const set = this.cache.get(identifier);
      if (set.indexOf(node) !== -1) throw fail(`Already registered`);

      set.push(node);

      if (lastCacheUpdate) {
        this.updateLastCacheModificationPerId(identifier);
      }
    }
  }

  has(type, identifier) {
    const set = this.cache.get(identifier);
    if (!set) return false;
    return set.some((candidate) => type.isAssignableFrom(candidate.type));
  }

  resolve(type, identifier) {
    const set = this.cache.get(identifier);
    if (!set) return null;

    const matches = set.filter((candidate) => type.isAssignableFrom(candidate.type));
    switch (matches.length) {
      case 0:
        return null;
      case 1:
        return matches[0];
      default:
        throw fail(
          `Cannot resolve a reference to type '${
            type.name
          }' with id: '${identifier}' unambigously, there are multiple candidates: ${matches
            .map((n) => n.path)
            .join(', ')}`
        );
    }
  }
}
