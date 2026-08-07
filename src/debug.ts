/* eslint-disable no-console */
function getRaiser(error: any) {
  const regex = /\((.*):(\d+):(\d+)\)$/;
  const found = regex.exec(error.stack.split('\n')[2]) || false;
  if (!found) return {};
  const [path] = found;
  const { message } = error;
  return {
    path,
    error: message,
  };
}

/**
 * Gets the error information for debugin
 * @param {Error} error - The Error object
 * @return Object
 */
export default function logDebug(error: any) {
  const res = getRaiser(error);
  const msg = { ...res, source: 'xpref' };
  console.log(msg);
}
