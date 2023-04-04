import { getParent, types } from '../src';
import { Root } from './helper';

describe('getParent基本用法', () => {
  const root = Root.create({
    array: [{}],
    obj: {},
  });

  const arrayChild = root.array[0];

  it('level 1', () => {
    expect(getParent(arrayChild)).toBe(root.array);
    expect(getParent(root.array)).toBe(root);
    expect(getParent(root.obj)).toBe(root);
  });

  it('level 2', () => {
    expect(getParent(arrayChild, 2)).toBe(root);
  });
});

describe('getParent其它应用场景', () => {
  it('在子元素初始化周期访问parent', () => {
    let _parentAtCreate;

    const Child = types.vue({
      data() {
        return {
          name: 'child',
        };
      },

      created() {
        expect(true).toBe(true);
        _parentAtCreate = getParent(this);
      },
    });

    const Parent = types.vue({
      data() {
        return {
          name: 'parent',
          child: Child,
        };
      },
    });

    expect.assertions(2);

    const parent = Parent.create({
      child: {},
    });

    expect(_parentAtCreate).toBe(parent);
  });
});
