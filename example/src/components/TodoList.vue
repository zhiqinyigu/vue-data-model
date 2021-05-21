<template>
  <section>
    <header class="flex flex--middle">
      <input type="text" v-model="name" />
      <button @click="addItem">add</button>
    </header>

    <ol>
      <li
        v-for="(todo, i) in todoList.list"
        :key="i"
        :class="['flex flex--middle', { 'text-del': todo.isDone }]"
      >
        <div class="flex-item" @click="todo.toggle()">
          {{ todo.name }} ({{
            todo.length ? "name length: " + todo.length : "empty"
          }})
        </div>
        <button @click="todo.remove()">remove</button>
      </li>
    </ol>

    <footer>
      <div>total: {{ todoList.total }}</div>
      <div>done count: {{ todoList.doneList.length }}</div>
      <div>undone count: {{ todoList.undoneList.length }}</div>
    </footer>
  </section>
</template>

<script>
import TodoList from "../models/TodoList";

export default {
  data() {
    return {
      todoList: TodoList.create(),
      name: "",
    };
  },
  methods: {
    addItem() {
      this.todoList.add(this.name);
      this.name = "";
    },
  },
};
</script>

<style src="./TodoList.css"></style>