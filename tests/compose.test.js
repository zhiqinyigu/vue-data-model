import { types } from '..';

const Biology = types.vue({
  data() {
    return {
      life: 1,
    };
  },
  computed: {
    cnLife() {
      return this.life ? '还活着' : '不在了';
    },
  },
});

// 男人
const Man = types.compose(
  Biology,
  types.vue({
    data() {
      return {
        name: '',
        age: 0,
        gender: '男',
      };
    },
  })
);

it('基本使用', () => {
  const man = Man.create({ name: '中年男子' });

  expect(man.$toValue()).toMatchObject({
    name: '中年男子',
    age: 0,
    gender: '男',
    life: 1,
  });

  expect(man.cnLife).toBe('还活着');
});

it('compose不是类继承', () => {
  const man = Man.create();

  expect(Man.is(man)).toBe(true);
  expect(Biology.is(man)).toBe(false);
});
