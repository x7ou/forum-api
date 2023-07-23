const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should return response 201 and persisted comment', async () => {
      // Arrange
      const server = await createServer(container);
      const testUserName = 'testUserName';
      const testPassword = 'testPassword';
      const testFullName = 'Test Full Name';

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: testUserName,
          password: testPassword,
          fullname: testFullName,
        },
      });
      /** login user */
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: testUserName,
          password: testPassword,
        },
      });

      /** add thread */
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'any thread title',
          body: 'any thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;
      const requestPayload = {
        content: 'any comment',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response a 400 error when payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);
      const testUserName = 'testUserName';
      const testPassword = 'testPassword';
      const testFullName = 'Test Full Name';

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: testUserName,
          password: testPassword,
          fullname: testFullName,
        },
      });
      /** login user */
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: testUserName,
          password: testPassword,
        },
      });

      /** add thread */
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'any thread title',
          body: 'any thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;
      const requestPayload = {};

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan comment, pastikan semua field terisi');
    });

    it('should response a 401 error when add payload without authentication', async () => {
      // Arrange
      const server = await createServer(container);
      const testUserName = 'testUserName';
      const testPassword = 'testPassword';
      const testFullName = 'Test Full Name';

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: testUserName,
          password: testPassword,
          fullname: testFullName,
        },
      });
      /** login user */
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: testUserName,
          password: testPassword,
        },
      });

      /** add thread */
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'any thread title',
          body: 'any thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;
      const requestPayload = {
        content: 'a comment without authorization',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response a 404 error when add payload with incorrect thread id', async () => {
      // Arrange
      const server = await createServer(container);
      const testUserName = 'testUserName';
      const testPassword = 'testPassword';
      const testFullName = 'Test Full Name';

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: testUserName,
          password: testPassword,
          fullname: testFullName,
        },
      });
      /** login user */
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: testUserName,
          password: testPassword,
        },
      });

      /** add thread */
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'any thread title',
          body: 'any thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const threadId = 'thread-incorrect';
      const requestPayload = {
        content: 'a comment with incorrect thread id',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should return response 200 when comment is deleted', async () => {
      // Arrange
      const server = await createServer(container);
      const testUserName = 'testUserName';
      const testPassword = 'testPassword';
      const testFullName = 'Test Full Name';

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: testUserName,
          password: testPassword,
          fullname: testFullName,
        },
      });

      /** login user */
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: testUserName,
          password: testPassword,
        },
      });

      /** add thread */
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'any thread title',
          body: 'any thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      /** add comment */
      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'any comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Action
      const { id: commentId } = JSON.parse(commentResponse.payload).data.addedComment;
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should throw a 401 error when delete comment without authenntication', async () => {
      // Arrange
      const server = await createServer(container);
      const testUserName = 'testUserName';
      const testPassword = 'testPassword';
      const testFullName = 'Test Full Name';

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: testUserName,
          password: testPassword,
          fullname: testFullName,
        },
      });

      /** login user */
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: testUserName,
          password: testPassword,
        },
      });

      /** add thread */
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'any thread title',
          body: 'any thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      /** add comment */
      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'any comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Action
      const { id: commentId } = JSON.parse(commentResponse.payload).data.addedComment;
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should throw a 403 error when delete comment without authorization', async () => {
      // Arrange
      const server = await createServer(container);
      const testUserName = 'testUserName';
      const testPassword = 'testPassword';
      const testFullName = 'Test Full Name';

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: testUserName,
          password: testPassword,
          fullname: testFullName,
        },
      });

      /** login user */
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: testUserName,
          password: testPassword,
        },
      });

      /** add thread */
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'any thread title',
          body: 'any thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      /** add user 2 */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'secondUser',
          password: 'secondpassword',
          fullname: 'Second User',
        },
      });

      /** login user 2 */
      const secondLoginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'secondUser',
          password: 'secondpassword',
        },
      });

      /** add comment by user 2 */
      const { data: { accessToken: secondAccessToken } } = JSON.parse(secondLoginResponse.payload);
      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'any comment',
        },
        headers: {
          Authorization: `Bearer ${secondAccessToken}`,
        },
      });

      // Action
      /** delete comment by different user */
      const { id: commentId } = JSON.parse(commentResponse.payload).data.addedComment;
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });

    it('should throw a 404 error when delete comment with incorect thread id', async () => {
      // Arrange
      const server = await createServer(container);
      const testUserName = 'testUserName';
      const testPassword = 'testPassword';
      const testFullName = 'Test Full Name';

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: testUserName,
          password: testPassword,
          fullname: testFullName,
        },
      });

      /** login user */
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: testUserName,
          password: testPassword,
        },
      });

      /** add thread */
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'any thread title',
          body: 'any thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      /** add user 2 */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'secondUser',
          password: 'secondpassword',
          fullname: 'Second User',
        },
      });

      /** login user 2 */
      const secondLoginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'secondUser',
          password: 'secondpassword',
        },
      });

      /** add comment by user 2 */
      const { data: { accessToken: secondAccessToken } } = JSON.parse(secondLoginResponse.payload);
      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'any comment',
        },
        headers: {
          Authorization: `Bearer ${secondAccessToken}`,
        },
      });

      // Action
      /** delete comment with incorrect thread id */
      const { id: commentId } = JSON.parse(commentResponse.payload).data.addedComment;
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-incorrect/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${secondAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should throw a 404 error when delete comment with incorect comment id', async () => {
      // Arrange
      const server = await createServer(container);
      const testUserName = 'testUserName';
      const testPassword = 'testPassword';
      const testFullName = 'Test Full Name';

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: testUserName,
          password: testPassword,
          fullname: testFullName,
        },
      });

      /** login user */
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: testUserName,
          password: testPassword,
        },
      });

      /** add thread */
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'any thread title',
          body: 'any thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      /** add user 2 */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'secondUser',
          password: 'secondpassword',
          fullname: 'Second User',
        },
      });

      /** login user 2 */
      const secondLoginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'secondUser',
          password: 'secondpassword',
        },
      });

      /** add comment by user 2 */
      const { data: { accessToken: secondAccessToken } } = JSON.parse(secondLoginResponse.payload);
      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'any comment',
        },
        headers: {
          Authorization: `Bearer ${secondAccessToken}`,
        },
      });

      // Action
      /** delete incorrect comment id */
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-incorrect`,
        headers: {
          Authorization: `Bearer ${secondAccessToken}`,
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
