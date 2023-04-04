import { typeCheckFailure, typeCheckSuccess } from '../checker';
import { CoreType } from './primitives';

export class Func extends CoreType {
  constructor() {
    super('func', v => typeof v === 'function');
  }

  isValidSnapshot(value, context) {
    if (this.checker(value)) {
      return typeCheckSuccess();
    }

    return typeCheckFailure(context, value, `Value is not a ${this.name}`);
  }
}

export const func = new Func();
