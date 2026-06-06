const _projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
if (!_projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required");
}
export const projectId = _projectId;

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-06-01";
