import { getTreeNode, types } from '../src';

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

it('正确保存了identifierAttribute', () => {
  const foo = Foo.create(dataRepository.stringFactory());

  expect(getTreeNode(foo).identifierAttribute).toBe('id');
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

  expect(() => NumberFoo.create(dataRepository.noIdFactory())).toThrow();
  expect(() => NumberFoo.create(dataRepository.stringFactory())).toThrow();
  expect(() => NumberFoo.create(dataRepository.numberFactory())).not.toThrow();
});
