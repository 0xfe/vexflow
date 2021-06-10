export class RuntimeError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super('[RuntimeError] ' + code + ':' + message);
    this.code = code;
  }
}

// Default log function sends all arguments to console.
export function log(
  block: string,
  // eslint-disable-next-line
  ...args: any[]): void {
  if (!args) return;
  const line = Array.prototype.slice.call(args).join(' ');
  window.console.log(block + ': ' + line);
}

// Dump warning to console.
export function warn(
  // eslint-disable-next-line
  ...args: any[]): void {
  const line = args.join(' ');
  const err = new Error();
  window.console.log('Warning: ', line, err.stack);
}
