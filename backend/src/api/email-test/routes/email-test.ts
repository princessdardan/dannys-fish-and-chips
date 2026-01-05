export default {
  routes: [
    {
      method: 'POST',
      path: '/email-test',
      handler: 'email-test.send',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
