import { types } from '../src';

const Card = types.vue({
  data() {
    return {
      id: 0,
      filter: false,
    };
  },
});

const VM = types.vue({
  data() {
    return {
      cardList: types.array(Card),
    };
  },

  computed: {
    availableList() {
      return this.cardList.filter((item) => item.filter);
    },
    totalCount() {
      return this.cardList.length;
    },
  },
});

describe('变异方法应与原方法功能相同', () => {
  const vm = VM.create({
    cardList: [1, 2, 3, 4].map((id) => ({ id })),
  });

  it('初始化', () => {
    expect(vm.cardList.slice(0)).toMatchObject([
      { id: 1, filter: false },
      { id: 2, filter: false },
      { id: 3, filter: false },
      { id: 4, filter: false },
    ]);
  });

  it('push', () => {
    vm.cardList.push(
      { id: 5, filter: false },
      { id: 6, filter: false },
      { id: 7, filter: false },
      { id: 8, filter: false },
      { id: 9, filter: false },
      { id: 10, filter: false }
    );

    expect(vm.cardList.slice(0)).toMatchObject([
      { id: 1, filter: false },
      { id: 2, filter: false },
      { id: 3, filter: false },
      { id: 4, filter: false },
      { id: 5, filter: false },
      { id: 6, filter: false },
      { id: 7, filter: false },
      { id: 8, filter: false },
      { id: 9, filter: false },
      { id: 10, filter: false },
    ]);
  });

  it('splice', () => {
    vm.cardList.splice(15, 2);
    expect(vm.cardList.slice(0)).toMatchObject([
      { id: 1, filter: false },
      { id: 2, filter: false },
      { id: 3, filter: false },
      { id: 4, filter: false },
      { id: 5, filter: false },
      { id: 6, filter: false },
      { id: 7, filter: false },
      { id: 8, filter: false },
      { id: 9, filter: false },
      { id: 10, filter: false },
    ]);

    vm.cardList.splice(7);
    expect(vm.cardList.slice(0)).toMatchObject([
      { id: 1, filter: false },
      { id: 2, filter: false },
      { id: 3, filter: false },
      { id: 4, filter: false },
      { id: 5, filter: false },
      { id: 6, filter: false },
      { id: 7, filter: false },
    ]);

    vm.cardList.splice(4, 2);
    expect(vm.cardList.slice(0)).toMatchObject([
      { id: 1, filter: false },
      { id: 2, filter: false },
      { id: 3, filter: false },
      { id: 4, filter: false },
      { id: 7, filter: false },
    ]);
  });
});

describe('类型系统支持', () => {
  let vm;

  beforeEach(() => {
    vm = VM.create({
      cardList: [],
    });
  });

  it('初始化默认值', () => {
    expect(vm.cardList instanceof Array).toBe(true);
    expect(vm.cardList.length).toBe(0);
  });

  it('类型默认值', () => {
    vm = VM.create({
      cardList: [{}],
    });

    expect(vm.cardList instanceof Array).toBe(true);
    expect(vm.cardList.length).toBe(1);
    expect(vm.totalCount).toBe(1);
    expect(vm.cardList[0].id).toBe(0);
    expect(vm.cardList[0].filter).toBe(false);
    expect(Card.is(vm.cardList[0])).toBe(true);
  });
});

describe('常用的变异方法能导致更新', () => {
  let vm;

  beforeEach(() => {
    vm = VM.create({
      cardList: [],
    });
  });

  it('push', () => {
    // 此用于触发computed计算，收集依赖。
    expect(vm.availableList.length).toBe(0);
    expect(vm.totalCount).toBe(0);

    vm.cardList.push({ id: 1, filter: true });
    vm.cardList.push({});

    expect(vm.availableList.length).toBe(1);
    expect(vm.totalCount).toBe(2);
  });

  it('splice', () => {
    // 此用于触发computed计算，收集依赖。
    expect(vm.availableList.length).toBe(0);
    expect(vm.totalCount).toBe(0);

    vm.cardList.splice(0, 0, { id: 1, filter: true }, {});

    expect(vm.availableList.length).toBe(1);
    expect(vm.totalCount).toBe(2);

    vm.cardList.splice(0, 1);

    expect(vm.availableList.length).toBe(0);
    expect(vm.totalCount).toBe(1);
  });
});

describe('其它', () => {
  it('$toValue输出', () => {
    const vm = VM.create({
      cardList: [{}, { id: 1 }, { id: 2, filter: true }],
    });

    expect(vm.$toValue()).toMatchObject({
      cardList: [
        { id: 0, filter: false },
        { id: 1, filter: false },
        { id: 2, filter: true },
      ],
    });
  });
});
