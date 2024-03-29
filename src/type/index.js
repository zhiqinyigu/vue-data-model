import { string, number, boolean, nullType, undefinedType } from './primitives';
import { array } from './array';
import { vue } from './vue';
import { vo } from './vo';
import { compose, composeVo } from './compose';
import { literal } from './literal';
import { union } from './union';
import { identifier, identifierNumber } from './identifier';
import { reference } from './reference';
import { optional } from './optional';
import { maybe, maybeNull } from './maybe';
import { late } from './late';
import { custom } from './custom';
import { func } from './func';
import { any, anyValue } from './any';
import { enumeration } from './enumeration';

export * from './base';

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
  optional,
  maybe,
  maybeNull,
  late,
  custom,
  func,
  any,
  anyValue,
  enumeration,
};
