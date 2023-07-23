const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should return response 201 and persisted thread', async () => {
      // Arrange
      const server = await createServer(container);
      const testUserName = 'testUserName';
      const testPassword = 'testPassword';
      const testFullName = 'Test Full Name';

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: testUserName,
          password: testPassword,
          fullname: testFullName,
        },
      });
      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: testUserName,
          password: testPassword,
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      const requestPayload = {
        title: 'any title',
        body: 'any body',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response a 400 error when payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);
      const testUserName = 'testUserName';
      const testPassword = 'testPassword';
      const testFullName = 'Test Full Name';

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: testUserName,
          password: testPassword,
          fullname: testFullName,
        },
      });
      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: testUserName,
          password: testPassword,
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      const requestPayload = {
        title: 'any title',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru, pastikan semua field terisi');
    });

    it('should throw a 401 error when add payload without authentication', async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: 'any title',
        body: 'any body',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should return response 201 and persited thread detail', async () => {
      // Arrange
      const server = await createServer(container);
      const userOne = {
        username: 'Batman',
        password: 'password-1',
        fullname: 'Bruce Wayne',
      };
      const userTwo = {
        username: 'Robin',
        password: 'password-2',
        fullname: 'Dick Grayson',
      };
      const threadPayload = {
        title: 'Gotham News',
        body: 'Joker escaped Arkham Asylum!',
      };
      const commentOnePayload = {
        content: 'Really?',
      };
      const commentTwoPayload = {
        content: 'Its True!',
      };
      /** add users */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userOne,
      });
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userTwo,
      });
      /** login users */
      const loginOneResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userOne,
      });
      const loginTwoResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userTwo,
      });
      /** get access token from each user */
      const { data: { accessToken: accTokenOne } } = JSON.parse(loginOneResponse.payload);
      const { data: { accessToken: accTokenTwo } } = JSON.parse(loginTwoResponse.payload);
      /** post thread */
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${accTokenOne}`,
        },
      });
      /** post comments */
      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;
      const commentOneResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentOnePayload,
        headers: {
          Authorization: `Bearer ${accTokenTwo}`,
        },
      });
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentTwoPayload,
        headers: {
          Authorization: `Bearer ${accTokenOne}`,
        },
      });
      /** delete comment */
      const { id: commentId } = JSON.parse(commentOneResponse.payload).data.addedComment;
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accTokenTwo}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
    });

    it('should response a 404 error when thread id is not valid', async () => {
      // Arrange
      const server = await createServer(container);
      const userOne = {
        username: 'Batman',
        password: 'password-1',
        fullname: 'Bruce Wayne',
      };
      const userTwo = {
        username: 'Robin',
        password: 'password-2',
        fullname: 'Dick Grayson',
      };
      const threadPayload = {
        title: 'Gotham News',
        body: 'Joker escaped Arkham Asylum!',
      };
      const commentOnePayload = {
        content: 'Really?',
      };
      const commentTwoPayload = {
        content: 'Its True!',
      };
      /** add users */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userOne,
      });
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userTwo,
      });
      /** login users */
      const loginOneResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userOne,
      });
      const loginTwoResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userTwo,
      });
      /** get access token from each user */
      const { data: { accessToken: accTokenOne } } = JSON.parse(loginOneResponse.payload);
      const { data: { accessToken: accTokenTwo } } = JSON.parse(loginTwoResponse.payload);
      /** post thread */
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${accTokenOne}`,
        },
      });
      /** post comments */
      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;
      const commentOneResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentOnePayload,
        headers: {
          Authorization: `Bearer ${accTokenTwo}`,
        },
      });
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentTwoPayload,
        headers: {
          Authorization: `Bearer ${accTokenOne}`,
        },
      });
      /** delete comment */
      const { id: commentId } = JSON.parse(commentOneResponse.payload).data.addedComment;
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accTokenTwo}`,
        },
      });

      // Action (get an invalid thread id)
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-666',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});
