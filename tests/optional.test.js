import { types } from '../src/type';

const User = types.vue({
  data() {
    return {
      id: types.number,
      name: types.string,
    };
  },
  methods: {
    say() {},
  },
});

const RequireRoot = types.vue({
  data() {
    return {
      user: User,
    };
  },
});

const MaybeRoot = types.vue({
  data() {
    return {
      user: types.maybe(User),
    };
  },
});

const OptionalRoot = types.vue({
  data() {
    return {
      user: types.optional(User, { id: 1, name: 'foo' }),
    };
  },
});

it('基本使用', function() {
  expect(OptionalRoot.create({})).toMatchObject({
    user: { id: 1, name: 'foo' },
  });

  expect(() => MaybeRoot.create()).not.toThrow();
  expect(() => MaybeRoot.create({})).not.toThrow();

  expect(() => RequireRoot.create()).toThrow();
  expect(() => RequireRoot.create({})).toThrow();
});
