const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('a postComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '1234567890';

      /** add user */
      const registerUser = new RegisterUser({
        username: 'any_user',
        password: 'any_password',
        fullname: 'Any Full Name',
      });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      /** add thread */
      const addThread = new AddThread({
        title: 'any title',
        body: 'any body',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      /** add comment */
      const addComment = new AddComment({
        content: 'any comment',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({}); // add user-123
      const registeredUser = await userRepositoryPostgres.addUser(registerUser);
      const addedThread = await threadRepositoryPostgres.postThread({
        ...addThread,
        owner: registeredUser.id,
      });
      await commentRepositoryPostgres.postComment({
        ...addComment,
        threadId: addedThread.id,
        owner: 'user-123',
      });

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-1234567890');
      expect(comment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '1234567890';

      /** add user */
      const registerUser = new RegisterUser({
        username: 'any_user',
        password: 'any_password',
        fullname: 'Any Full Name',
      });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      /** add thread */
      const addThread = new AddThread({
        title: 'any title',
        body: 'any body',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      /** add comment */
      const addComment = new AddComment({
        content: 'any comment',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({}); // add user-123
      const registeredUser = await userRepositoryPostgres.addUser(registerUser);
      const addedThread = await threadRepositoryPostgres.postThread({
        ...addThread,
        owner: registeredUser.id,
      });
      const addedComment = await commentRepositoryPostgres.postComment({
        ...addComment,
        threadId: addedThread.id,
        owner: 'user-123',
      });

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-1234567890',
        content: 'any comment',
        owner: 'user-123',
      }));
    });
  });

  describe('a VerifyCommentId function', () => {
    it('should throw notFoundError when payload contain incorrect comment id', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.postThread({});
      await CommentsTableTestHelper.postComment({});
      const payload = {
        commentId: 'comment-incorrect',
      };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentId(payload.commentId))
        .rejects.toThrowError('comment tidak ditemukan');
    });

    it('should not throw notFoundError when payload contain correct comment id', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.postThread({});
      await CommentsTableTestHelper.postComment({});
      const payload = {
        commentId: 'comment-1234567890',
      };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentId(payload.commentId))
        .resolves.not.toThrowError('comment tidak ditemukan');
    });
  });

  describe('a VerifyCommentOwner function', () => {
    it('should throw authorizationError when payload contain incorrect owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.postThread({});
      await CommentsTableTestHelper.postComment({});
      const payload = {
        commentId: 'comment-1234567890',
        userId: 'user-incorrect',
      };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(payload.commentId, payload.userId))
        .rejects.toThrowError('anda tidak memiliki otorisasi untuk menghapus comment ini');
    });

    it('should not throw authorizationError when payload contain correct comment id', async () => {
      // Arrange
      const userId = 'user1234567890';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.postThread({ owner: userId });
      await CommentsTableTestHelper.postComment({ owner: userId });
      const payload = {
        commentId: 'comment-1234567890',
        userId,
      };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(payload.commentId, payload.userId))
        .resolves.not.toThrowError('anda tidak memiliki otorisasi untuk menghapus comment ini');
    });
  });

  describe('a deleteComment function', () => {
    it('should throw error when comment cannot be (already) deleted', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.postThread({});
      await CommentsTableTestHelper.postComment({ isDelete: true });
      const payload = {
        commentId: 'comment-1234567890',
      };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // action and assert
      await expect(commentRepositoryPostgres.deleteComment(payload.commentId))
        .rejects.toThrowError(InvariantError);
    });

    it('should delete comment by updating the is_delete column', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.postThread({});
      await CommentsTableTestHelper.postComment({
        id: 'comment-1234567890',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // action
      await commentRepositoryPostgres.deleteComment('comment-1234567890');

      // assert
      expect(await CommentsTableTestHelper.findCommentById('comment-1234567890'))
        .toHaveLength(0);
      expect(await CommentsTableTestHelper.getDeletedCommentById('comment-1234567890'))
        .toEqual({
          id: 'comment-1234567890',
          is_delete: true,
        });
    });
  });

  describe('a getCommentByThreadId function', () => {
    it('should return all comments associated with thread id', async () => {
      // Arrange
      const userOne = {
        id: 'user-1',
        username: 'Batman',
      };
      const userTwo = {
        id: 'user-2',
        username: 'Robin',
      };
      const threadOne = {
        id: 'thread-1',
        owner: userOne.id,
      };
      const commentOne = {
        id: 'comment-1',
        content: 'Comment number One',
        date: 'date one',
        threadId: threadOne.id,
        owner: userTwo.id,
        isDelete: false,
      };
      const commentTwo = {
        id: 'comment-2',
        content: 'contoh deleted comment',
        date: 'date two',
        threadId: threadOne.id,
        owner: userOne.id,
        isDelete: true,
      };
      /** add users */
      await UsersTableTestHelper.addUser(userOne);
      await UsersTableTestHelper.addUser(userTwo);
      /** post thread */
      await ThreadsTableTestHelper.postThread(threadOne);
      /** post comments */
      await CommentsTableTestHelper.postComment(commentOne);
      await CommentsTableTestHelper.postComment(commentTwo);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      const getCommentsByThreadId = await commentRepositoryPostgres
        .getCommentsByThreadId(threadOne.id);

      // Assert
      expect(getCommentsByThreadId).toStrictEqual([
        {
          id: 'comment-1',
          content: 'Comment number One',
          date: 'date one',
          username: 'Robin',
          is_delete: false,
        },
        {
          id: 'comment-2',
          content: 'contoh deleted comment',
          date: 'date two',
          username: 'Batman',
          is_delete: true,
        },
      ]);
    });
  });
});
