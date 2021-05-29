import { fail } from '../utils';
import { ComplexType } from './base';

export default class Union extends ComplexType {
  constructor(_types) {
    super();
    this._types = _types;
  }

  isAssignableFrom(type) {
    return this._types.some((subType) => subType.isAssignableFrom(type));
  }

  createNewInstance(res) {
    const { _types } = this;

    for (let index = 0; index < _types.length; index++) {
      try {
        return _types[index].create(res);
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }

    throw fail(`Union could not determine the type`);
  }

  is(val) {
    const { _types } = this;

    for (let index = 0; index < _types.length; index++) {
      if (_types[index].is(val)) {
        return true;
      }
    }

    return false;
  }
}
