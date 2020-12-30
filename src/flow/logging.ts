// Dump warning to console.
export const WARN = (...args: unknown[]): void => {
  const line = args.join(' ');
  window.console.log('Warning: ', line, StackTrace());
};

export const LOG = (block: string, args?: unknown[]): void => {
  if (!args) return;
  const line = Array.prototype.slice.call(args).join(' ');
  window.console.log(block + ': ' + line);
};

// Get stack trace.
const StackTrace = (): string => {
  const err = new Error();
  return err.stack;
};
