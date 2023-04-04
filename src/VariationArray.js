// import { getVue } from './utils';

const { slice } = Array.prototype;
const toArray = (list) => (list ? slice.call(list) : list);

const variationArrayMethods = {
  _overwriteParams: (val) => val,

  push() {
    const args = arguments;
    this._willChange && this._willChange('push', args);
    return this.__proto__.push.apply(
      this,
      toArray(arguments).map((item, index) => this._overwriteParams(item, index, 'push', args))
    );
  },

  splice(start, deleteCount, ...added) {
    const args = arguments;
    this._willChange && this._willChange('splice', args);
    return this.__proto__.splice.apply(
      this,
      [start, arguments.length >= 2 ? deleteCount : Infinity].concat(
        toArray(added).map((item, index) => this._overwriteParams(item, index, 'splice', args))
      )
    );
  },
};

function VariationArray() {
  var self = new Array(...arguments);

  // const Vue = getVue();
  // Vue.observable(self);

  // Object.setPrototypeOf(self, VariationArray.prototype);

  // vue似乎会对修改数组的原型链
  for (var key in variationArrayMethods) {
    self[key] = variationArrayMethods[key];
  }

  return self;
}

// Object.setPrototypeOf(VariationArray.prototype, Array.prototype);

VariationArray.clone = function(arr, template) {
  const list = new VariationArray();

  if (template) {
    list._overwriteParams = template._overwriteParams;
    list._willChange = template._willChange;
    template.created && template.created.call(list);
  }

  list.push(...arr);
  return list;
};

export default VariationArray;
