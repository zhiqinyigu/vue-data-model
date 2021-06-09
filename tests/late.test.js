import { types } from '../src';

const Tag = types.vue({
  data() {
    return {
      id: types.number,
      name: types.string,
      subs: types.maybe(types.array(types.late(() => Tag))),
    };
  },
  computed: {
    subString() {
      return this.subs ? this.subs.map((tag) => tag.name).join(',') : '';
    },
  },
  methods: {
    addSub(tag) {
      if (!this.subs) {
        this.subs = [];
      }

      this.subs.push(tag);
    },
  },
});

it('基本使用', () => {
  const tag = Tag.create({
    id: 1,
    name: 'C',
    subs: [
      { id: 2, name: 'video' },
      { id: 3, name: 'photos' },
    ],
  });

  expect(tag.$toValue()).toMatchObject({
    id: 1,
    name: 'C',
    subs: [
      { id: 2, name: 'video' },
      { id: 3, name: 'photos' },
    ],
  });

  expect(Tag.is(tag)).toBe(true);
  expect(Tag.is(tag.subs[1])).toBe(true);
  expect(Tag.is({ id: 1 })).toBe(false);

  expect(tag.subString).toBe('video,photos');
  expect(tag.subs[1].subString).toBe('');
});

it('空数据初始化', () => {
  const tag = Tag.create({
    id: 1,
    name: 'C',
    subs: [],
  });

  tag.addSub({ id: 2, name: 'video' });

  expect(tag.subString).toBe('video');
  expect(tag.subs[0].subString).toBe('');
  expect(Tag.is(tag.subs[0])).toBe(true);

  expect(() => tag.addSub({ id: 3 })).toThrow();
});
