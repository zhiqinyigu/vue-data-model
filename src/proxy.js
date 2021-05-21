const transmit = val => val;
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: null,
  set: null
};

export { transmit, proxy };
export default function proxy(target, proxy, key, setter = transmit) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return proxy[key];
  };

  sharedPropertyDefinition.set = function proxySetter(val) {
    proxy[key] = setter(val);
  };

  Object.defineProperty(target, key, sharedPropertyDefinition);
}