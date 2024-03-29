## Introduction

一个类似[_mobx-state-tree_](https://github.com/mobxjs/mobx-state-tree)的响应式状态容器系统（reactive state container system ）。内部实现基于[_Vue_](https://github.com/vuejs/vue)，创建出来的对象是一个 vue 实例。这使得你在不熟悉 _mobx-state-tree_ 的情况下，也能轻松上手，并且很容易在你现有的 vue 项目中使用。

## Install

```Bash
npm i vue-data-model
```

## Example

[codesandbox online](https://codesandbox.io/s/vue-data-model-todo-list-app-tkvof)

[directory](https://github.com/zhiqinyigu/vue-data-model/tree/master/example)

## Terminology

开始之前，让我们先统一一下术语。

**type(类型)**
由 `types.xxx()` 方法创建的对象，它具备自我描述的特性，类似于 _面向对象(oop)_ 的 _类_。

**state(状态)**
一般通过 _type(类型)_ 的 `create()` 方法创建的类型实例对象。

## How to use

**step 1:** 使用 `types.vue` 定义通用类型。该方法接受 vue 组件选项（vue component options）作为唯一参数。

```JavaScript
import { types } from 'vue-data-model';
const Todo = types.vue({
  data() {
    return {
      name: '',
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
    }
  }
});
```

**step 2:** 通过类型的 `type.create()` 创建类型实例。

```JavaScript
/* 不传参数创建 */
const defaultTodo = Todo.create();

console.log(defaultTodo.name === ''); // true
console.log(defaultTodo.isDone === false); // true

defaultTodo.toggle();
console.log(defaultTodo.isDone === true); // true


/* 传默认值来创建 */
const initialData = {name: 'todo 1'};
const todoDefaultValue = Todo.create(initialData);

console.log(todoDefaultValue.name === 'todo 1'); // true
console.log(todoDefaultValue.isDone === false); // true

/* 基于vue的响应式状态容器系统 */
console.log(Todo.create() instanceof Vue) // true
```

## 与 1.1.x 不兼容的破坏性更新：

1. types.vue 在定义时，将计算一次 date()来提取子节点类型，并缓存起来。这意味着 data()将同步执行一次。
   例如：

```javascript
const Parent = types.vue({
  data() {
    return {
      name: 'parent',
      child: Child, // 这里访问不到Child，需要将Child的定义提升到Parent之前，或者使用types.late(() => Child)
    };
  },
});

const Child = types.vue({
  data() {
    return {
      name: 'child',
    };
  },
});
```

2. model 的类型节点不再支持 null/undefined 来初始化，这意味着它们是初始化的必填项。
   例如：

```javascript
// 接着上面的例子
Parent.create(); // will throw error
Parent.create({}); // will throw error

// correct
Parent.create({
  child: {},
});

// 或者Parent的child改为types.optional(Child, () => {})或types.maybe(Child)定义
```

## API

### types

汇聚类型创建相关方法：

- **types.vue(vueOptions)**
  基于一个 vue 组件定义创建一个类型。详看：如何使用。

- **types.vo(typeOrLiteral, vueOptions)**
  基于一个 vue 组件定义创建一个类型，类似于`types.vue`，用于创建 _DDD_ 的 _Value Object_。唯一区别`types.vo`不需要接受 data 定义，内部将实际的值放在 value 字段下，并重载了`$toValue`方法。

  **typeOrLiteral**: Value Object 的默认值或者类型。

  **vueOptions**: vue 组件选项。

```JavaScript
const Email = types.vo('', {
  computed: {
    length() {
      return this.value.length;
    },
    isVaild() {
      return /@gmail.com$/.test(this.value);
    },
  },
});

const VM = types.vue({
  data() {
    return {
      email: Email,
    };
  },
});

const vm = VM.create({
  email: 'cainiao@gmail.com'
});

console.log(vm.email.value); // 'cainiao@gmail.com'
console.log(vm.email.isVaild); // true
console.log(vm.$toValue()); // {email: 'cainiao@gmail.com'}
```

- **types.literal(value)**
  定义一个字面量类型，与 `types.union` 配合时很有用。参考于 `mobx-state-tree`。

```JavaScript
const L1 = types.literal(1);

console.log(L1.create(1) === 1);
console.log(L1.is(1) === true);

L1.create(); // will throw error, an equal value must be specified.
L1.create(2); // will throw error, an equal value must be specified.
```

- **types.union(types...)**
  定义一个联合类型。实际开发中也许会遇到这样的情况：一个值的类型可能是类型 A，也可能是类型 B。参考于 `mobx-state-tree`。

```JavaScript
const Man = types.vue({
  data() {
    return {
      name: '',
      gender: types.literal('men'),
    };
  },
});

const Woman = types.vue({
  data() {
    return {
      name: '',
      gender: types.literal('women'),
    };
  },
});

const Humam = types.union(Man, Woman);

const humam = Humam.create({
  gender: 'women',
  name: 'Lucie',
});

console.log(Humam.is(humam)); // true
console.log(Woman.is(humam)); // true
console.log(Man.is(humam)); // false
console.log(Man.is(humam)); // false

```

- **types.compose(types...)**
  组合多个类型成为一个新的类型。参考于 `mobx-state-tree`。

```JavaScript

const Man = types.vue({
  data() {
    return {
      name: '',
    };
  },
});

const Superpower = types.vue({
  data() {
    return {
      role: 'decent',
      energyValue: 10,
    };
  },
  computed: {
    alias() {
      return `A ${this.role} Hero: ${this.name}`
    }
  },
  methods: {
    lasing() {
      this.energyValue = this.energyValue - 1;
      // dosomething
    }
  }
});

const SuperMan = types.compose(Man, Superpower);

const hero = SuperMan.create({name: 'Jack'});

console.log(hero.alias); // `A decent Hero: Jack`;
console.log(SuperMan.is(hero)); // true
console.log(Man.is(hero)); // false. compose is not Class inheritance.

```

- **types.composeVo(types...)**
  组合多个类型成为一个新的 ValueObject 类型。跟 types.compose 的区别是，`types.compose`使用`types.vue`创建新类型，而`types.composeVo`使用`types.vo`。

- **types.array(type)**
  定义数组类型。参考于 `mobx-state-tree`。

```JavaScript
const Todo = types.vue({
  data() {
    return {
      name: '',
    }
  },

  methods: {
    remove() {
      const arr = getParent(this);

      arr.splice(arr.indexOf(this), 1);
    }
  }
});

const TodoList = types.vue({
  data() {
    return {
      list: types.array(Todo)
    }
  }
});

const todoList = TodoList.create({
  list: [{name: 'get up'}]
});

console.log(todoList.$toValue());
/*
{
  list: [{name: "get up"}]
}
*/

todoList.list[0].remove();
todoList.list.push({name: 'go back to sleep'})
console.log('remove' in todoList.list[0]) // true
```

### state

- **\$toValue(replacer)**
  将 state 转成一个纯对象，只包含 data 域的内容。replacer 是 `JSON.stringify(data, replacer)` 的参数。

```JavaScript
// 让我们基于 step 1 的Todo。
const todo = Todo.create({name: 'aa'});

console.log(todo.$toValue());
// {name: 'aa', isDone: false}

```

- **\$assign(data, replacer = defaultReplacer)**
  安全的对 state 进行赋值。

```JavaScript
// 让我们基于 step 1 的Todo。
const todo = Todo.create({name: 'aa'});

todo.$assign({
  name: 'bb',
  toggle: 'foo',
  boo: 'boo'
});

console.log(typeof todo.toggle === 'function'); // true
console.log('boo' in todo); // false

```

### getParent

**getParent(state, deep = 1)**
获取当前*state*的父节点。*deep*表示往上查找的层级数，默认是 1。参考于 `mobx-state-tree`。

```JavaScript
// 让我们基于 types.array 的例子示范
import { types, getParent } from 'vue-data-model';
console.log(getParent(todoList.list[0], 1) === todoList.list); // true
console.log(getParent(todoList.list[0], 2) === todoList); // true
```
