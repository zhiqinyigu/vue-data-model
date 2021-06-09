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
