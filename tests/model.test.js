import { mount } from '@vue/test-utils';
import { Root } from './helper';

const defaultSnapshot = {
  name: 'root',
  obj: {
    name: 'parent',
  },
  array: [],
};

describe('类型系统支持', () => {
  let vm;

  beforeEach(() => {
    vm = Root.create({
      obj: {},
      array: [],
    });
  });

  it('基本使用', () => {
    expect(vm.$toValue()).toMatchObject(defaultSnapshot);
  });

  it('array数组基本使用', () => {
    vm.array.push({ name: 'child1' });

    expect(vm.array[0].name).toBe('child1');
    expect(vm.array[0].cnName).toBe('child1 -> 孩子');
  });
});

describe('响应式特性', () => {
  const PageComponent = {
    template: `
      <div>
        <button @click="vm.addChild({name: '' + count++})">add Child</button>
        <p id="count">child count: {{ childCount }}</p>
        <ol>
          <li
            v-for="(item, i) in vm.array"
            :key="i"
          >{{item.cnName}}</li>
        </ol>
      </div>
    `,
    data() {
      return {
        count: 1,
        vm: Root.create({
          obj: {},
          array: [],
        }),
      };
    },
    computed: {
      childCount() {
        return this.vm.array.length;
      },
    },
  };

  it('能被vue跟踪', async () => {
    const page = mount(PageComponent);
    const button = page.find('button');

    expect(page.findAll('li').length).toBe(0);
    expect(page.find('#count').text()).toContain('child count: 0');

    await button.trigger('click');
    await button.trigger('click');

    expect(page.findAll('li').length).toBe(2);
    expect(page.find('#count').text()).toContain('child count: 2');
    expect(
      page
        .findAll('li')
        .at(1)
        .text()
    ).toContain('2 -> 孩子');
  });
});

describe('自动管理实例的销毁', () => {
  let vm;

  beforeEach(() => {
    vm = Root.create({
      obj: {
        child: { name: 'obj child' },
      },
      array: [{ name: 'array child' }],
    });
  });

  it('基本使用', () => {
    expect(vm.obj.child.cnName).toBe('obj child -> 孩子');

    const obj = vm.obj;
    vm.obj = {};

    obj.name = 'obj child2';
    expect(obj.child._isDestroyed).toBe(true);
    expect(obj.child.cnName).not.toBe('obj child2 -> 孩子');
  });

  it('数组使用', () => {
    const child1 = vm.array[0];

    expect(child1.cnName).toBe('array child -> 孩子');

    vm.array = [];
    child1.name = 'array child2';

    expect(child1._isDestroyed).toBe(true);
    expect(child1.cnName).not.toBe('array child2 -> 孩子');
  });

  it('数组splice', () => {
    const child1 = vm.array[0];

    expect(child1.cnName).toBe('array child -> 孩子');

    vm.array.splice(0, 1);
    child1.name = 'array child2';

    expect(child1._isDestroyed).toBe(true);
    expect(child1.cnName).not.toBe('array child2 -> 孩子');
  });
});
