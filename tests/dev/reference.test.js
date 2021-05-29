import { types } from '../../src';

const Foo = types.vue({
  data() {
    return {
      id: types.identifier,
      title: '',
    };
  },
});

const FooStore = types.vue({
  data() {
    return {
      foo: types.reference(Foo),
      foos: types.array(Foo),
    };
  },
});

describe('传参', () => {
  const vm = FooStore.create({
    foo: '17',
    foos: [{ id: '17', name: 'Michel' }],
  });

  expect(typeof vm.foo).toBe('object');
  expect(vm.foo.id).toBe('17');
  expect(vm.foo.name).toBe('Michel');
  expect(vm.foo).toBe(vm.foos[0]);
  expect(vm.$toValue()).toMatchObject({
    foo: '17',
    foos: [{ id: '17', name: 'Michel' }],
  });
});

