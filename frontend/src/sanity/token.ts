import "server-only";
import { readToken } from "./server-env";

export function getReadToken(): string {
  if (!readToken) {
    throw new Error("SANITY_API_READ_TOKEN is not set");
  }
  return readToken;
}
