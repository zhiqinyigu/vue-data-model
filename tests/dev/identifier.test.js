import { types } from '../../src';

const Foo = types.vue({
  data() {
    return {
      id: types.identifier,
      name: '',
    };
  },
});

const dataRepository = {
  noIdFactory: () => ({
    name: 'Michel',
  }),

  numberFactory: (id = 17) => ({
    id: +id,
    name: 'Michel',
  }),

  stringFactory: (id = 17) => ({
    id: id + '',
    name: 'Michel',
  }),
};

it('基本支持', () => {
  const foo = Foo.create(dataRepository.stringFactory());

  expect(foo.id).toBe('17');
  expect(foo.name).toBe('Michel');
  expect(foo.$toValue()).toMatchObject(dataRepository.stringFactory());
});

it('identifier类型不匹配不能创建', () => {
  const NumberFoo = types.vue({
    data() {
      return {
        id: types.identifierNumber,
        name: '',
      };
    },
  });

  expect(() => Foo.create(dataRepository.noIdFactory())).toThrow();
  expect(() => Foo.create(dataRepository.numberFactory())).toThrow();

  expect(() => NumberFoo.create(dataRepository.numberFactory())).not.toThrow();
  expect(() => NumberFoo.create(dataRepository.noIdFactory())).toThrow();
});

it('同一个store的同一个实体，identifier必须保持唯一', () => {
  const Store = types.vue({
    data() {
      return {
        foos: types.array(Foo),
      };
    },
  });

  expect(() =>
    Store.create({
      foos: [dataRepository.stringFactory('17'), dataRepository.stringFactory('18')],
    })
  ).not.toThrow();

  // expect(() =>
  //   Store.create({
  //     foos: [dataRepository.stringFactory('17'), dataRepository.stringFactory('17')],
  //   })
  // ).toThrow();
});
