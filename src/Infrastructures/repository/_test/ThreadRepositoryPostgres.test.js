const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
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
});
