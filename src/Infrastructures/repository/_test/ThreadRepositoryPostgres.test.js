const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const GetThread = require('../../../Domains/threads/entities/GetThread');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('a postThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '1234567890';
      const testOwner = 'user-1234567890';
      const registerUser = new RegisterUser({
        username: 'any_user',
        password: 'any password',
        fullname: 'any name',
      });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      const addThread = new AddThread({
        title: 'any title',
        body: 'any body',
      });
      addThread.owner = testOwner;
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await userRepositoryPostgres.addUser(registerUser);
      await threadRepositoryPostgres.postThread(addThread);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById('thread-1234567890');
      expect(thread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '1234567890';
      const testOwner = 'user-1234567890';
      const registerUser = new RegisterUser({
        username: 'any_user',
        password: 'any password',
        fullname: 'any name',
      });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      const addThread = new AddThread({
        title: 'any title',
        body: 'any body',
      });
      addThread.owner = testOwner;
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const registeredUser = await userRepositoryPostgres.addUser(registerUser);
      const addedThread = await threadRepositoryPostgres.postThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-1234567890',
        title: 'any title',
        owner: registeredUser.id,
      }));
    });
  });

  describe('A verifyThreadId function', () => {
    it('should throw not found error when payload contain incorrect thread_id', async () => {
      // Arrange
      const payload = {
        threadId: 'thread-incorrect',
      };
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action and Assert
      await expect(threadRepositoryPostgres.verifyThreadId(payload.threadId)).rejects.toThrowError('thread tidak ditemukan');
    });

    it('should not throw not found error when payload contain correct thread_id', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.postThread({});
      const payload = {
        threadId: 'thread-1234567890',
      };
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action and Assert
      await expect(threadRepositoryPostgres.verifyThreadId(payload.threadId)).resolves.not.toThrowError('thread tidak ditemukan');
    });
  });

  describe('a getThread function', () => {
    it('should throw notFoundError when payload contain incorrect thread_id', async () => {
      // Arrange
      const payload = {
        threadId: 'thread-incorrect',
      };
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action and Assert
      await expect(threadRepositoryPostgres.getThreadById(payload.threadId)).rejects.toThrowError('thread tidak ditemukan');
    });

    it('should return thread correctly', async () => {
      // Arrange
      /** add user */
      await UsersTableTestHelper.addUser({
        id: 'user-999',
        username: 'theBatman',
      });
      /** post thread */
      await ThreadsTableTestHelper.postThread({
        id: 'thread-1234567890',
        title: 'any thread',
        body: 'any body',
        date: '2023-06-01T07:19:09.775Z',
        owner: 'user-999',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action
      const getThreadDetail = await threadRepositoryPostgres.getThreadById('thread-1234567890');

      // Assert
      expect(getThreadDetail).toStrictEqual(new GetThread({
        id: 'thread-1234567890',
        title: 'any thread',
        body: 'any body',
        date: '2023-06-01T07:19:09.775Z',
        username: 'theBatman',
      }));
    });
  });
});
