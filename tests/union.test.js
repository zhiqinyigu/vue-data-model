import { types } from '..';

it('结合literal使用', () => {
  // 男人
  const Man = types.vue({
    data() {
      return {
        name: '',
        gender: types.literal('男')
      };
    }
  });

  // 女人
  const Woman = types.vue({
    data() {
      return {
        name: '',
        gender: types.literal('女')
      };
    }
  });

  const Humam = types.union(Man, Woman);

  const humam = Humam.create({
    gender: '女',
    name: '未提供姓名的热心人士'
  });

  expect(humam.toJSON()).toMatchObject({
    gender: '女',
    name: '未提供姓名的热心人士'
  });

  expect(Humam.is(humam)).toBe(true);
  expect(Woman.is(humam)).toBe(true);
  expect(Man.is(humam)).toBe(false);
  expect(Humam.is(Man.create({ gender: '男' }))).toBe(true);
});

it('按定义时传入的顺序初始化，能初始化则确定类型', () => {
  // 男人
  const Man = types.vue({
    data() {
      return {
        name: '',
        gender: '男'
      };
    }
  });

  // 女人
  const Woman = types.vue({
    data() {
      return {
        name: '',
        gender: '女'
      };
    }
  });

  const Humam = types.union(Man, Woman);

  const humam = Humam.create({
    gender: '女',
    name: '未提供姓名的热心人士'
  });

  expect(Humam.is(humam)).toBe(true);
  expect(Woman.is(humam)).toBe(false);
  expect(Man.is(humam)).toBe(true);
});
