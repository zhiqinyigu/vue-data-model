import { types } from '../src';

it('基本使用', function() {
  expect(types.string.create('12')).toBe('12');
  expect(() => types.string.create(12)).toThrow();
});

it('is', function() {
  expect(types.string.is('12')).toBe(true);
  expect(types.string.is(12)).toBe(false);
});

it('嵌套对象', function() {
  const VM = types.vue({
    data() {
      return {
        id: 12,
        name: types.string,
      };
    },
  });

  const vm = VM.create({
    name: 'foo',
  });

  expect(vm).toMatchObject({
    id: 12,
    name: 'foo',
  });

  expect(vm.$toValue()).toMatchObject({
    id: 12,
    name: 'foo',
  });

  expect(() =>
    VM.create({
      name: 9,
    })
  ).toThrow();

  expect(() => {
    vm.name = 9;
  }).toThrow();
});
