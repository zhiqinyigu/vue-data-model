import { string, number, boolean, nullType, undefinedType } from './primitives';
import { array } from './array';
import { vue } from './vue';
import { vo } from './vo';
import { compose, composeVo } from './compose';
import { literal } from './literal';
import { union } from './union';
import { identifier, identifierNumber } from './identifier';
import { reference } from './reference';

export * from './base';
export * from './array';
export * from './literal';
export * from './vue';
export * from './union';
export * from './vo';
export * from './compose';

export const types = {
  string,
  number,
  boolean,
  nullType,
  undefinedType,
  vue,
  vo,
  array,
  literal,
  union,
  compose,
  composeVo,
  identifier,
  identifierNumber,
  reference,
};
