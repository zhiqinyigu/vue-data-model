import { getTreeNode, isTreeNodeValue } from './node/node-utils';
import { fail, isPrimitive, isTypeCheckingEnabled } from './utils';

const EMPTY_ARRAY = [];

function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch (e) {
    // istanbul ignore next
    return `<Unserializable: ${e}>`;
  }
}

function shortenPrintValue(valueInString) {
  return valueInString.length < 280
    ? valueInString
    : `${valueInString.substring(0, 272)}......${valueInString.substring(valueInString.length - 8)}`;
}

export function prettyPrintValue(value) {
  return typeof value === 'function'
    ? `<function${value.name ? ' ' + value.name : ''}>`
    : isTreeNodeValue(value)
    ? `<${value}>`
    : `\`${safeStringify(value)}\``;
}

function toErrorString(error) {
  const { value } = error;
  const type = error.context[error.context.length - 1].type;
  const fullPath = error.context
    .map(({ path }) => path)
    .filter((path) => path.length > 0)
    .join('/');

  const pathPrefix = fullPath.length > 0 ? `at path "/${fullPath}" ` : ``;

  const currentTypename = isTreeNodeValue(value)
    ? `value of type ${getTreeNode(value).type.name}:`
    : isPrimitive(value)
    ? 'value'
    : 'snapshot';
  const isSnapshotCompatible = type && isTreeNodeValue(value) && type.is(getTreeNode(value).snapshot);

  return (
    `${pathPrefix}${currentTypename} ${prettyPrintValue(value)} is not assignable ${
      type ? `to type: \`${type.name}\`` : ``
    }` +
    (error.message ? ` (${error.message})` : '') +
    (type
      ? /* isPrimitiveType(type) || */ isPrimitive(value)
        ? `.`
        : `, expected an instance of \`${type.name}\` or a snapshot like \`${type.describe()}\` instead.` +
          (isSnapshotCompatible
            ? ' (Note that a snapshot of the provided value is compatible with the targeted type)'
            : '')
      : `.`)
  );
}

export function getContextForPath(context, path, type) {
  return context.concat([{ path, type }]);
}

export function typeCheckSuccess() {
  return EMPTY_ARRAY;
}

export function typeCheckFailure(context, value, message) {
  return [{ context, value, message }];
}

export function flattenTypeErrors(errors) {
  return errors.reduce((a, i) => a.concat(i), []);
}

export function typecheckInternal(type, value) {
  // runs typeChecking if it is in dev-mode or through a process.env.ENABLE_TYPE_CHECK flag
  if (isTypeCheckingEnabled()) {
    typecheck(type, value);
  }
}

export function typecheck(type, value) {
  const errors = type.validate(value, [{ path: '', type }]);

  if (errors.length > 0) {
    throw fail(validationErrorsToString(type, value, errors));
  }
}

function validationErrorsToString(type, value, errors) {
  if (errors.length === 0) {
    return undefined;
  }

  return (
    `Error while converting ${shortenPrintValue(prettyPrintValue(value))} to \`${type.name}\`:\n\n    ` +
    errors.map(toErrorString).join('\n    ')
  );
}
