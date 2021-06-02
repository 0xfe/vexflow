export class RuntimeError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super('[RuntimeError] ' + code + ':' + message);
    this.code = code;
  }
}
