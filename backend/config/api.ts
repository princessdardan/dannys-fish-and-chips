// Global REST API pagination defaults applied to all content types.
// These limits shape the response payload size for list endpoints.
export default {
  rest: {
    defaultLimit: 25,
    maxLimit: 100,
    withCount: true,
  },
};
