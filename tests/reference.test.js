import { types } from '../src';

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

  it('赋值', () => {
    expect(vm.foo).toMatchObject({ id: '17', name: 'Michel' });

    vm.foo = '18';
    expect(vm.foo).toMatchObject({ id: '18', name: 'Lucy' });
  });

  it('找不到引用时为undefined', () => {
    vm.foo = '19';
    expect(vm.foo).toBeUndefined();
  });
});

describe('数组操作', () => {
  it('无实体时，reference为undefined', () => {
    const vm = FooStore.create({
      foo: '17',
    });

    expect(vm.foo).toBeUndefined();

    vm.foos.push({ id: '17', name: 'Michel' });
    expect(vm.foo).toMatchObject({ id: '17', name: 'Michel' });
  });

  it('变异方法', () => {
    const vm = FooStore.create({
      foo: '17',
      refs: ['17', '18'],
      foos: [
        { id: '17', name: 'Michel' },
        { id: '18', name: 'Lucy' },
      ],
    });

    expect(vm.foo).toMatchObject({ id: '17', name: 'Michel' });

    // 删除实体： { id: '17', name: 'Michel' }
    vm.foos.splice(0, 1);
    expect(vm.foo).toBeUndefined();
    expect(vm.refs.slice(0)).toMatchObject([undefined, { id: '18', name: 'Lucy' }]);
    expect(vm.foos.slice(0)).toMatchObject([{ id: '18', name: 'Lucy' }]);
    expect(vm.$toValue()).toMatchObject({
      foo: '17',
      refs: ['17', '18'],
      foos: [{ id: '18', name: 'Lucy' }],
    });

    // push identifier: ['21', '23', '24', '25']
    vm.refs.push('21', '23', '24', '25');
    expect(vm.refs.slice(0)).toMatchObject([
      undefined,
      { id: '18', name: 'Lucy' },
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(vm.$toValue()).toMatchObject({
      foo: '17',
      refs: ['17', '18', '21', '23', '24', '25'],
      foos: [{ id: '18', name: 'Lucy' }],
    });

    // splice(0, 3, '18', '100');
    vm.refs.splice(0, 3, '18', '100');
    expect(vm.refs.slice(0)).toMatchObject([{ id: '18', name: 'Lucy' }, undefined, undefined, undefined, undefined]);
    expect(vm.$toValue()).toMatchObject({
      foo: '17',
      refs: ['18', '100', '23', '24', '25'],
      foos: [{ id: '18', name: 'Lucy' }],
    });

    // 重新赋值['30', '56', '34', '18', '17']
    vm.refs = ['30', '56', '34', '18', '17'];
    expect(vm.refs.slice(0)).toMatchObject([undefined, undefined, undefined, { id: '18', name: 'Lucy' }, undefined]);
    expect(vm.$toValue()).toMatchObject({
      foo: '17',
      refs: ['30', '56', '34', '18', '17'],
      foos: [{ id: '18', name: 'Lucy' }],
    });

    // foos.push({ id: '17', name: 'Michel' });
    vm.foos.push({ id: '17', name: 'Michel' });
    expect(vm.refs.slice(0)).toMatchObject([
      undefined,
      undefined,
      undefined,
      { id: '18', name: 'Lucy' },
      { id: '17', name: 'Michel' },
    ]);
    expect(vm.$toValue()).toMatchObject({
      foo: '17',
      refs: ['30', '56', '34', '18', '17'],
      foos: [
        { id: '18', name: 'Lucy' },
        { id: '17', name: 'Michel' },
      ],
    });
  });
});

// it('同一个store的同一个实体，identifier必须保持唯一', () => {
//   const Store = types.vue({
//     data() {
//       return {
//         foos: types.array(Foo),
//       };
//     },
//   });

//   expect(() =>
//     Store.create({
//       foos: [dataRepository.stringFactory('17'), dataRepository.stringFactory('18')],
//     })
//   ).not.toThrow();

//   console.log(
//     Store.create({
//       foos: [dataRepository.stringFactory('17'), dataRepository.stringFactory('18')],
//     }).$treenode.identifierCache
//   );

//   console.log(
//     Store.create({
//       foos: [dataRepository.stringFactory('17'), dataRepository.stringFactory('17')],
//     }).$treenode.identifierCache
//   );

//   expect(() =>
//     Store.create({
//       foos: [dataRepository.stringFactory('17'), dataRepository.stringFactory('17')],
//     })
//   ).toThrow();
// });

// 用例二：identifier在每棵树下唯一，互不影响
// const Foo = types
//   .model({
//     id: types.identifier,
//     name: types.string,
//   })

// const Boo = types.model({
//   id: types.identifier,
//   title: types.string,
// });

// const FooStore = types.model({
//   foo: types.reference(Foo),
//   boo: types.reference(Boo),
//   foos: types.map(Foo),
//   boos: types.map(Boo),
// });

// const vm = FooStore.create({
//   foo: '17',
//   boo: '17',
//   foos: {
//     17: { id: '17', name: 'Michel' },
//     18: { id: '18', name: 'Veria' },
//   },
//   boos: {
//     17: { id: '17', title: 'boos Michel' },
//     18: { id: '18', title: 'boos Veria' },
//   },
// });
