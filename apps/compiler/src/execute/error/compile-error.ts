export default class CompileError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'COMPILE ERROR';
  }
}
