export default class TimeoutError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'TIMEOUT ERROR';
  }
}
