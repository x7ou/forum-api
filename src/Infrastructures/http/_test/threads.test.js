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
});
