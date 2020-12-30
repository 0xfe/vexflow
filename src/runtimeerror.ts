// Default runtime exception.
export class RuntimeError {
  constructor(private readonly code: string, private readonly message?: string) {
    this.code = code;
    this.message = message;
  }

  toString(): string {
    return '[RuntimeError] ' + this.code + ':' + this.message;
  }
}

export class GenericException extends Error {
  data: unknown;

  constructor(message?: string, data?: unknown) {
    super(message);
    this.message = message;
    this.data = data;
  }
}

export const MakeException = (name: string): typeof GenericException => {
  return class extends GenericException {
    constructor(message?: string, data?: unknown) {
      super(message, data);
      this.name = name;
    }
  };
};
