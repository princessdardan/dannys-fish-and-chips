import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";
import { readToken } from "./server-env";

export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
  token: readToken,
  stega: {
    studioUrl: "/studio",
  },
});
