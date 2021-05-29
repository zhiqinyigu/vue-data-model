import { types } from '../../src';

const Foo = types.vue({
  data() {
    return {
      id: types.identifier,
      name: '',
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

describe('基本特征', () => {
  const vm = FooStore.create({
    foo: '17',
    foos: [{ id: '17', name: 'Michel' }],
  });

  it('引用功能', () => {
    expect(vm.foo.id).toBe('17');
    expect(vm.foo.name).toBe('Michel');
    expect(vm.foo).toBe(vm.foos[0]);
  });

  it('$toValue应该返回原始数据', () => {
    expect(vm.$toValue()).toMatchObject({
      foo: '17',
      foos: [{ id: '17', name: 'Michel' }],
    });
  });
});
