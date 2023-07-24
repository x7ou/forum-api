const CommentLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likes',
  register: async (server, { container }) => {
    const commentLikesHandler = new CommentLikesHandler(container);
    server.route(routes(commentLikesHandler));
  },
};
