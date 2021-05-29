const { slice } = Array.prototype;
const toArray = list => (list ? slice.call(list) : list);

const variationArrayMethods = {
  _overwriteParams: val => val,

  push() {
    return this.__proto__.push.apply(this, toArray(arguments).map(this._overwriteParams.bind(this)));
  },

  splice(start, deleteCount, ...args) {
    return this.__proto__.splice.apply(this, [start, deleteCount].concat(toArray(args).map(this._overwriteParams.bind(this))));
  }
};

function VariationArray() {
  var self = new Array(...arguments);
  Object.setPrototypeOf(self, VariationArray.prototype);

  // vue似乎会对修改数组的原型链
  for (var key in variationArrayMethods) {
    self[key] = variationArrayMethods[key];
  }

  return self;
}

Object.setPrototypeOf(VariationArray.prototype, Array.prototype);

VariationArray.clone = function(arr, template) {
  const list = new VariationArray();

  if (template) {
    list._overwriteParams = template._overwriteParams;
    template.created && template.created.call(list);
  }

  list.push(...Array.prototype.slice.call(arr));
  return list;
};

export default VariationArray;
