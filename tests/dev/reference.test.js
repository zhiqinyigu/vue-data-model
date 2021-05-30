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
      refs: types.array(types.reference(Foo)),
      foos: types.array(Foo),
    };
  },
});

describe('基本特征', () => {
  const vm = FooStore.create({
    foo: '17',
    refs: ['17', '18'],
    foos: [
      { id: '17', name: 'Michel' },
      { id: '18', name: 'Lucy' },
    ],
  });

  it('引用功能', () => {
    expect(vm.foo.id).toBe('17');
    expect(vm.foo.name).toBe('Michel');
    expect(vm.foo).toBe(vm.foos[0]);
  });

  it('数组支持', () => {
    expect(vm.refs[0].id).toBe('17');
    expect(vm.refs[0].name).toBe('Michel');

    expect(vm.refs[1].id).toBe('18');
    expect(vm.refs[1].name).toBe('Lucy');

    expect(vm.refs[0]).toBe(vm.foos[0]);
    expect(vm.refs[1]).toBe(vm.foos[1]);
  });

  it('$toValue应该返回原始数据', () => {
    expect(vm.$toValue()).toMatchObject({
      foo: '17',
      refs: ['17', '18'],
      foos: [
        { id: '17', name: 'Michel' },
        { id: '18', name: 'Lucy' },
      ],
    });
  });
});
