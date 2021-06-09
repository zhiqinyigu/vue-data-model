import { nullType, undefinedType } from './primitives';
import { optional } from './optional';
import { union } from './union';

const optionalUndefinedType = optional(undefinedType, undefined);
const optionalNullType = optional(nullType, null);

export function maybe(type) {
  return union(type, optionalUndefinedType);
}

export function maybeNull(type) {
  return union(type, optionalNullType);
}
