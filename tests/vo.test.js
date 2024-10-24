import { types } from '../src';

const Email = types.vo('', {
  computed: {
    length() {
      return this.value.length;
    },
    isVaild() {
      return /@gmail.com$/.test(this.value);
    },
  },
  methods: {
    load() {},
  },
});

const VM = types.vue({
  data() {
    return {
      email: Email,
    };
  },
});

describe('传参', () => {
  it('必须规定传2个参数', () => {
    expect(() => types.vo({})).toThrow();
    expect(() => types.vo({}, {})).not.toThrow();
  });

  it('预置undefined作为未知值', () => {
    const Unkonw = types.vo(undefined, {});
    expect(Unkonw.create(123).value).toBe(123);
  });

  it('预置null作为未知值', () => {
    const Unkonw = types.vo(null, {});
    expect(Unkonw.create(123).value).toBe(123);
  });
});

describe('类型系统支持', () => {
  it('初始化默认值', () => {
    const vm = VM.create();

    expect(vm.email.value).toBe('');
    expect(vm.email.isVaild).toBe(false);
    expect(typeof vm.email.load).toBe('function');
  });

  it('字符串值初始化', () => {
    const testEmail = 'cainiao@gmail.com';
    const vm = VM.create({
      email: testEmail,
    });

    expect(vm.email.value).toBe(testEmail);
    expect(vm.email.length).toBe(testEmail.length);
    expect(vm.email.isVaild).toBe(true);
    expect(vm.email == testEmail).toBe(true);
  });

  it('对象值初始化', () => {
    const Todo = types.vo(
      {
        title: '',
        content: '',
      },
      {
        computed: {
          titleLength() {
            return this.value.title.length;
          },
          str() {
            return this.value.title + this.value.content;
          },
        },
      }
    );

    const VM = types.vue({
      data() {
        return {
          todo: Todo,
        };
      },
    });

    const todo = {
      title: '我在健身房',
      content: '发现了',
    };
    const vm = VM.create({
      todo,
    });

    expect(vm.todo.value).toBe(todo);
    expect(vm.todo.titleLength).toBe(5);
    expect(vm.todo.str).toBe('我在健身房' + '发现了');
    expect(vm.$toValue()).toMatchObject({ todo });
  });

  it('数组值初始化', () => {
    const Todos = types.vo([], {
      computed: {
        len() {
          return this.value.length;
        },
        truely() {
          return this.value.filter(Boolean);
        },
      },
    });

    const VM = types.vue({
      data() {
        return {
          todos: Todos,
        };
      },
    });

    const todos = [1, '', 4, 0];
    const vm = VM.create({
      todos,
    });

    expect(vm.todos.value).toBe(todos);
    expect(vm.todos.len).toBe(4);
    expect(vm.todos.truely.length).toBe(2);
    expect(vm.$toValue()).toMatchObject({ todos });
  });

  it('类型初始化', () => {
    const Todo = types.vue({
      data() {
        return {
          title: '',
        };
      },
      computed: {
        titleLength() {
          return this.title.length;
        },
      },
    });

    const TodoWrap = types.vo(Todo, {
      computed: {
        len() {
          return this.value.title.length;
        },
      },
    });

    const VM = types.vue({
      data() {
        return {
          todo: TodoWrap,
        };
      },
    });

    const todo = { title: 'foo' };
    const vm = VM.create({
      todo,
    });

    expect(vm.todo.len).toBe(3);
    expect(vm.todo.value.titleLength).toBe(3);
    expect(vm.$toValue()).toMatchObject({ todo });
  });
});

describe('其它', () => {
  it('$toValue输出', () => {
    const vm = VM.create({
      email: 'cainiao@gmail.com',
    });

    expect(vm.email.$toValue()).toBe('cainiao@gmail.com');

    expect(vm.$toValue()).toMatchObject({
      email: 'cainiao@gmail.com',
    });
  });
});
