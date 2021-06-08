import { types } from '../src';

const Root = types.vue({
  data() {
    return {
      name: 'root',
      obj: Parent,
      array: types.array(Child)
    };
  },

  methods: {
    addChild(child) {
      this.array.push(child);
    }
  }
});

const Parent = types.vue({
  data() {
    return {
      name: 'parent',
      child: Child
    };
  }
});

const Child = types.vue({
  data() {
    return {
      name: 'child'
    };
  },

  computed: {
    cnName() {
      return this.name + ' -> 孩子';
    }
  }
});

export { Root, Parent, Child };
