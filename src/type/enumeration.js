import { union } from './union';
import { literal } from './literal';

export function enumeration(name, options) {
  const realOptions = typeof name === 'string' ? options : name;

  const type = union(...realOptions.map((option) => literal('' + option)));
  if (typeof name === 'string') type.name = name;
  return type;
}
