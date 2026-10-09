class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const ensure = (condition, message, status = 400) => {
  if (!condition) throw new HttpError(status, message);
};
module.exports = { HttpError, ensure };
