import VariationArray from '../src/VariationArray';

describe('变异方法应与原方法功能相同', () => {
  const arr = new VariationArray(1, 2, 3, 4);

  it('初始化', () => {
    expect(arr.slice(0)).toMatchObject([1, 2, 3, 4]);
  });

  it('push', () => {
    arr.push(5, 6, 7, 8, 9, 10);
    expect(arr.slice(0)).toMatchObject([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('splice', () => {
    arr.splice(15, 2);
    expect(arr.slice(0)).toMatchObject([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    arr.splice(7);
    expect(arr.slice(0)).toMatchObject([1, 2, 3, 4, 5, 6, 7]);

    arr.splice(4, 2);
    expect(arr.slice(0)).toMatchObject([1, 2, 3, 4, 7]);
  });
});
