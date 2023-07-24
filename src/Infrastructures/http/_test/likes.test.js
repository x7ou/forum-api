const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should return response 200 when user try to like or unlike a comment', async () => {
      // Arrange
      const server = await createServer(container);
      const userOne = {
        username: 'Batman',
        password: 'theBatman',
        fullname: 'Bruce Wayne',
      };
      const userTwo = {
        username: 'Joker',
        password: 'theClownPrince',
        fullname: 'Arthur Fleck',
      };

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userOne,
        },
      });

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userTwo,
        },
      });

      /** login user */
      const loginOneResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          ...userOne,
        },
      });

      const loginTwoResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          ...userTwo,
        },
      });
      const { data: { accessToken: accessTokenOne } } = JSON.parse(loginOneResponse.payload);
      const { data: { accessToken: accessTokenTwo } } = JSON.parse(loginTwoResponse.payload);

      /** add thread */
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Got Ham',
          body: 'this is a thread',
        },
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });
      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;

      /** add comment */
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'this is a comment for a thread',
        },
        headers: {
          Authorization: `Bearer ${accessTokenTwo}`,
        },
      });
      const { id: commentId } = JSON.parse(commentResponse.payload).data.addedComment;

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response a 401 error when try to like or unlike a comment without authentication', async () => {
      // Arrange
      const server = await createServer(container);
      const userOne = {
        username: 'Batman',
        password: 'theBatman',
        fullname: 'Bruce Wayne',
      };
      const userTwo = {
        username: 'Joker',
        password: 'theClownPrince',
        fullname: 'Arthur Fleck',
      };

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userOne,
        },
      });

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userTwo,
        },
      });

      /** login user */
      const loginOneResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          ...userOne,
        },
      });

      const loginTwoResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          ...userTwo,
        },
      });
      const { data: { accessToken: accessTokenOne } } = JSON.parse(loginOneResponse.payload);
      const { data: { accessToken: accessTokenTwo } } = JSON.parse(loginTwoResponse.payload);

      /** add thread */
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Got Ham',
          body: 'this is a thread',
        },
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });
      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;

      /** add comment */
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'this is a comment for a thread',
        },
        headers: {
          Authorization: `Bearer ${accessTokenTwo}`,
        },
      });
      const { id: commentId } = JSON.parse(commentResponse.payload).data.addedComment;

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response a 404 error when try to like or unlike a comment with incorrect thread id', async () => {
      // Arrange
      const server = await createServer(container);
      const userOne = {
        username: 'Batman',
        password: 'theBatman',
        fullname: 'Bruce Wayne',
      };
      const userTwo = {
        username: 'Joker',
        password: 'theClownPrince',
        fullname: 'Arthur Fleck',
      };

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userOne,
        },
      });

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userTwo,
        },
      });

      /** login user */
      const loginOneResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          ...userOne,
        },
      });

      const loginTwoResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          ...userTwo,
        },
      });
      const { data: { accessToken: accessTokenOne } } = JSON.parse(loginOneResponse.payload);
      const { data: { accessToken: accessTokenTwo } } = JSON.parse(loginTwoResponse.payload);

      /** add thread */
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Got Ham',
          body: 'this is a thread',
        },
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });
      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;

      /** add comment */
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'this is a comment for a thread',
        },
        headers: {
          Authorization: `Bearer ${accessTokenTwo}`,
        },
      });
      const { id: commentId } = JSON.parse(commentResponse.payload).data.addedComment;

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/thread-123/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response a 404 error when try to like or unlike a comment with incorrect comment id', async () => {
      // Arrange
      const server = await createServer(container);
      const userOne = {
        username: 'Batman',
        password: 'theBatman',
        fullname: 'Bruce Wayne',
      };
      const userTwo = {
        username: 'Joker',
        password: 'theClownPrince',
        fullname: 'Arthur Fleck',
      };

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userOne,
        },
      });

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userTwo,
        },
      });

      /** login user */
      const loginOneResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          ...userOne,
        },
      });

      const loginTwoResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          ...userTwo,
        },
      });
      const { data: { accessToken: accessTokenOne } } = JSON.parse(loginOneResponse.payload);
      const { data: { accessToken: accessTokenTwo } } = JSON.parse(loginTwoResponse.payload);

      /** add thread */
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Got Ham',
          body: 'this is a thread',
        },
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });
      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;

      /** add comment */
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'this is a comment for a thread',
        },
        headers: {
          Authorization: `Bearer ${accessTokenTwo}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/comment-123/likes`,
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });
  });
});
