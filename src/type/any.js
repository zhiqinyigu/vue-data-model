import { typeCheckSuccess } from '../checker';
import { SimpleType } from './base';

export class Any extends SimpleType {
  constructor() {
    super('any');
  }

  describe() {
    return this.name;
  }

  createNewInstance(snapshot) {
    return snapshot;
  }

  is() {
    return true;
  }

  isValidSnapshot() {
    return typeCheckSuccess();
  }
}

export const any = new Any();
