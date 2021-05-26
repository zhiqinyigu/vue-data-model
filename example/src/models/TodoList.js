import { types } from 'vue-data-model';
import Todo from './Todo';

const TodoList = types.vue({
  data() {
    return {
      list: types.array(Todo)
    };
  },

  computed: {
    total() {
      return this.list.length;
    },

    doneList() {
      return this.list.filter(item => item.isDone);
    },

    undoneList() {
      return this.list.filter(item => !item.isDone);
    }
  },

  methods: {
    add(name) {
      this.list.push({name});
    },

    remove(item) {
      const index = this.list.indexOf(item);
      this.list.splice(index, 1);
    }
  }
});

export default TodoList;
