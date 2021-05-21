import { getParent, types } from "@chenyican/vue-model";

const Todo = types.vue({
  data() {
    return {
      name: "",
      isDone: false
    };
  },

  computed: {
    length() {
      return this.name.length;
    }
  },

  methods: {
    toggle() {
      this.isDone = !this.isDone;
    },

    remove() {
      getParent(this, 2).remove(this);
    }
  }
});

export default Todo;
