import { types } from '../src';

const Child = types.vue({
  data() {
    return {
      name: 'child',
    };
  },

  computed: {
    cnName() {
      return this.name + ' -> 孩子';
    },
  },
});

const Parent = types.vue({
  data() {
    return {
      name: 'parent',
      child: types.maybe(Child),
    };
  },
});

const Root = types.vue({
  data() {
    return {
      name: 'root',
      obj: Parent,
      array: types.array(Child),
    };
  },

  methods: {
    addChild(child) {
      this.array.push(child);
    },
  },
});

export { Root, Parent, Child };
