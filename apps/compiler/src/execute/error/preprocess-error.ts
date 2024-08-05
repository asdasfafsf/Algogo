export default class PreprocessError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'PREPROCESS ERROR';
  }
}
