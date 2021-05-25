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
});

const VM = types.vue({
  data() {
    return {
      email: Email,
    };
  },
});

describe('类型系统支持', () => {
  it('初始化默认值', () => {
    const vm = VM.create();

    expect(vm.email.value).toBe('');
    expect(vm.email.isVaild).toBe(false);
  });

  it('含值初始化', () => {
    const testEmail = 'cainiao@gmail.com';
    const vm = VM.create({
      email: testEmail,
    });

    expect(vm.email.value).toBe(testEmail);
    expect(vm.email.length).toBe(testEmail.length);
    expect(vm.email.isVaild).toBe(true);
  });
});

describe('其它', () => {
  it('toJSON输出', () => {
    const vm = VM.create({
      email: 'cainiao@gmail.com',
    });

    expect(vm.email.$toValue()).toBe('cainiao@gmail.com');

    expect(vm.$toValue()).toMatchObject({
      email: 'cainiao@gmail.com',
    });
  });
});
