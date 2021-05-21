export default class Type {
  constructor() {
    if (typeof this.create !== 'function' || typeof this.is !== 'function') {
      throw new Error('Type must define create and is methods');
    }
  }
}