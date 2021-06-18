import { typeCheckSuccess } from '../checker';
import { SimpleType } from './base';

export class Any extends SimpleType {
  constructor(defualtValue) {
    super('any');
    this._defualtValue = defualtValue;
  }

  describe() {
    return this.name;
  }

  createNewInstance(snapshot) {
    return typeof snapshot === 'undefined' ? this._getDefault() : snapshot;
  }

  is() {
    return true;
  }

  isValidSnapshot() {
    return typeCheckSuccess();
  }

  _getDefault() {
    if (typeof this._defualtValue === 'function') {
      return this._defualtValue();
    }

    return this._defualtValue;
  }
}

export const any = new Any();
export const anyValule = function(defualtValue) {
  return new Any(defualtValue);
};
