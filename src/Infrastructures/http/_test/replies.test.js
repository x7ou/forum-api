const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentRepliesTableTestHelper = require('../../../../tests/CommentRepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentRepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /thread/{threadId}/comments/{commentId}/replies', () => {
    it('should return reponse 201 and persisted reply', async () => {
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
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'this is a reply for a comment',
        },
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should reponse a 400 error when payload not contain not contain needed property', async () => {
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
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: false,
        },
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan balasan, pastikan semua field terisi');
    });

    it('should response a 401 error when add payload without authentication', async () => {
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
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'this is a reply for a comment',
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response a 404 error when add apyload with incorrect thread id', async () => {
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
        method: 'POST',
        url: `/threads/thread-123/comments/${commentId}/replies`,
        payload: {
          content: 'this is a reply for a comment',
        },
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

    it('should response a 404 error when add apyload with incorrect thread id', async () => {
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
        method: 'POST',
        url: `/threads/${threadId}/comments/comment-123/replies`,
        payload: {
          content: 'this is a reply for a comment',
        },
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

  describe('when DELETE /thread/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should return response 200 when reply is deleted', async () => {
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

      /** add reply */
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'this is a reply for a comment',
        },
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });
      const { id: replyId } = JSON.parse(replyResponse.payload).data.addedReply;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });

      // Asert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response a 401 error when delete reply without authentication', async () => {
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

      /** add reply */
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'this is a reply for a comment',
        },
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });
      const { id: replyId } = JSON.parse(replyResponse.payload).data.addedReply;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      });

      // Asert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response a 403 error when delete reply without authorization', async () => {
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

      /** add reply */
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'this is a reply for a comment',
        },
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });
      const { id: replyId } = JSON.parse(replyResponse.payload).data.addedReply;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessTokenTwo}`,
        },
      });

      // Asert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response a 404 when delete reply with incorrect thread id', async () => {
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

      /** add reply */
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'this is a reply for a comment',
        },
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });
      const { id: replyId } = JSON.parse(replyResponse.payload).data.addedReply;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-incorrect/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });

      // Asert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response a 404 when delete reply with incorrect comment id', async () => {
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

      /** add reply */
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'this is a reply for a comment',
        },
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });
      const { id: replyId } = JSON.parse(replyResponse.payload).data.addedReply;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-incorrect/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });

      // Asert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response a 404 when delete reply with incorrect thread id', async () => {
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

      /** add reply */
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'this is a reply for a comment',
        },
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/reply-incorrect`,
        headers: {
          Authorization: `Bearer ${accessTokenOne}`,
        },
      });

      // Asert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });
});
