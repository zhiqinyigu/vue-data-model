import { BaseType } from './base';
import { cannotDetermineSubtype, devMode, fail, isType } from '../utils';
import { typeCheckSuccess } from '../checker';

class Late extends BaseType {
  _subType;

  getSubType(mustSucceed) {
    if (!this._subType) {
      let t = undefined;
      try {
        t = this._definition();
      } catch (e) {
        if (e instanceof ReferenceError)
          // can happen in strict ES5 code when a definition is self refering
          t = undefined;
        else throw e;
      }
      if (mustSucceed && t === undefined)
        throw fail('Late type seems to be used too early, the definition (still) returns undefined');
      if (t) {
        if (devMode() && !isType(t))
          throw fail('Failed to determine subtype, make sure types.late returns a type definition.');
        this._subType = t;
      }
    }
    return this._subType;
  }

  constructor(name, _definition) {
    super(name);
    this._definition = _definition;
  }

  instantiate(parent, subpath, initialValue, environment) {
    return this.getSubType(true).instantiate(parent, subpath, initialValue, environment);
  }

  describe() {
    const t = this.getSubType(false);
    return t ? t.name : '<uknown late type>';
  }

  isValidSnapshot(value, context) {
    const t = this.getSubType(false);
    if (!t) {
      // See #916; the variable the definition closure is pointing to wasn't defined yet, so can't be evaluted yet here
      return typeCheckSuccess();
    }
    return t.validate(value, context);
  }

  isAssignableFrom(type) {
    const t = this.getSubType(false);
    return t ? t.isAssignableFrom(type) : false;
  }

  getSubTypes() {
    const subtype = this.getSubType(false);
    return subtype ? subtype : cannotDetermineSubtype;
  }
}

export function late(nameOrType, maybeType) {
  const name = typeof nameOrType === 'string' ? nameOrType : `late(${nameOrType.toString()})`;
  const type = typeof nameOrType === 'string' ? maybeType : nameOrType;

  if (devMode()) {
    if (!(typeof type === 'function' && type.length === 0))
      throw fail('Invalid late type, expected a function with zero arguments that returns a type, got: ' + type);
  }
  return new Late(name, type);
}
