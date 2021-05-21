import Type from '.';

export default class Union extends Type {
  constructor(list) {
    super();
    this.list = list;
  }

  create(res) {
    const { list } = this;

    for (let index = 0; index < list.length; index++) {
      try {
        return list[index].create(res);
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }

    throw new Error(`Union could not determine the type`);
  }

  is(val) {
    const { list } = this;

    for (let index = 0; index < list.length; index++) {
      if (list[index].is(val)) {
        return true;
      }
    }

    return false;
  }
}
