export default class RuntimeError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'RUNTIME ERROR';
  }
}
