import { ObjectNode, ScalarNode } from '.';

export function createObjectNode(type, parent, subpath, initialValue, environment) {
  return new ObjectNode(type, parent, subpath, initialValue, environment);
}

export function createScalarNode(type, parent, subpath, initialValue, environment) {
  return new ScalarNode(type, parent, subpath, initialValue, environment);
}
