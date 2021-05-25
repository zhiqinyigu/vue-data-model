import { types } from '..';

const L1 = types.literal(1);

it('基本使用', () => {
  expect(L1).not.toBe(1);

  expect(() => L1.create()).toThrow();
  expect(L1.create(1)).toBe(1);

  expect(L1.is(1)).toBe(true);
  expect(L1.is(2)).toBe(false);
});

describe('类型系统支持', () => {
  it('literal类型强制初始值传入', () => {
    const VM = types.vue({
      data() {
        return {
          num: L1
        };
      }
    });

    expect(() => VM.create()).toThrow();
    expect(() => VM.create({})).toThrow();
    expect(() => VM.create({ num: 2 })).toThrow();

    expect(VM.create({ num: 1 }).$toValue()).toMatchObject({ num: 1 });
  });
});
