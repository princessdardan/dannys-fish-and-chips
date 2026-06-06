import "server-only";

const _readToken = process.env.SANITY_API_READ_TOKEN;
if (!_readToken) {
  throw new Error("SANITY_API_READ_TOKEN is required for server-side fetches");
}
export const readToken = _readToken;

export const writeToken = process.env.SANITY_API_WRITE_TOKEN;
