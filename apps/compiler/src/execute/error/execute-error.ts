export default class ExecuteError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'EXECUTE ERROR';
  }
}
