const CommentRepliesTableTestHelper = require('../../../../tests/CommentRepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddCommentReplies = require('../../../Domains/replies/entities/AddCommentReplies');
const AddedCommentReplies = require('../../../Domains/replies/entities/AddedCommentReplies');
const pool = require('../../database/postgres/pool');
const CommentRepliesRepositoryPostgres = require('../CommentRepliesRepositoryPostgres');

describe('CommentRepliesRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentRepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('a postCommentReplies function', () => {
    it('should persist add comment replies and return posted reply correctly', async () => {
      // Arrange
      /** add users */
      await UsersTableTestHelper.addUser({
        id: 'user-1',
        username: 'Batman',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-2',
        username: 'Joker',
      });

      /** add thread */
      await ThreadsTableTestHelper.postThread({
        id: 'thread-1',
        owner: 'user-1',
      });

      /** add comment */
      await CommentsTableTestHelper.postComment({
        id: 'comment-1',
        owner: 'user-2',
        threadId: 'thread-1',
      });

      const fakeIdGenerator = () => '1234567890';
      const commentRepliesRepositoryPostgres = new CommentRepliesRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      const addCommentReplies = new AddCommentReplies({
        content: 'this is a comment reply',
      });

      // Action
      await commentRepliesRepositoryPostgres.postCommentReplies({
        ...addCommentReplies,
        commentId: 'comment-1',
        owner: 'user-1',
      });

      // Assert
      const commentReplies = await CommentRepliesTableTestHelper.findCommentRepliesById('reply-1234567890');
      expect(commentReplies).toHaveLength(1);
    });

    it('should return posted reply correctly', async () => {
      // Arrange
      /** add users */
      await UsersTableTestHelper.addUser({
        id: 'user-1',
        username: 'Batman',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-2',
        username: 'Joker',
      });

      /** add thread */
      await ThreadsTableTestHelper.postThread({
        id: 'thread-1',
        owner: 'user-1',
      });

      /** add comment */
      await CommentsTableTestHelper.postComment({
        id: 'comment-1',
        owner: 'user-2',
        threadId: 'thread-1',
      });

      const fakeIdGenerator = () => '1234567890';
      const commentRepliesRepositoryPostgres = new CommentRepliesRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      const addCommentReplies = new AddCommentReplies({
        content: 'this is a comment reply',
      });

      // Action
      const postedCommentReplies = await commentRepliesRepositoryPostgres.postCommentReplies({
        ...addCommentReplies,
        commentId: 'comment-1',
        owner: 'user-1',
      });

      // Assert
      expect(postedCommentReplies).toStrictEqual(new AddedCommentReplies({
        id: 'reply-1234567890',
        content: 'this is a comment reply',
        owner: 'user-1',
      }));
    });
  });

  describe('a verifyCommentRepliesId function', () => {
    it('should throw notFoundError when payload contain incorrect reply id', async () => {
      // Arrange
      /** add users */
      await UsersTableTestHelper.addUser({
        id: 'user-1',
        username: 'Batman',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-2',
        username: 'Joker',
      });

      /** add thread */
      await ThreadsTableTestHelper.postThread({
        id: 'thread-1',
        owner: 'user-1',
      });

      /** add comment */
      await CommentsTableTestHelper.postComment({
        id: 'comment-1',
        owner: 'user-2',
        threadId: 'thread-1',
      });

      const fakeIdGenerator = () => '1234567890';
      const commentRepliesRepositoryPostgres = new CommentRepliesRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      const addCommentReplies = new AddCommentReplies({
        content: 'this is a comment reply',
      });

      await commentRepliesRepositoryPostgres.postCommentReplies({
        ...addCommentReplies,
        commentId: 'comment-1',
        owner: 'user-1',
      });

      // Action and Assert
      await expect(commentRepliesRepositoryPostgres.verifyCommentRepliesId('reply-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw notFoundError when payload contain correct reply id', async () => {
      // Arrange
      /** add users */
      await UsersTableTestHelper.addUser({
        id: 'user-1',
        username: 'Batman',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-2',
        username: 'Joker',
      });

      /** add thread */
      await ThreadsTableTestHelper.postThread({
        id: 'thread-1',
        owner: 'user-1',
      });

      /** add comment */
      await CommentsTableTestHelper.postComment({
        id: 'comment-1',
        owner: 'user-2',
        threadId: 'thread-1',
      });

      const fakeIdGenerator = () => '1234567890';
      const commentRepliesRepositoryPostgres = new CommentRepliesRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      const addCommentReplies = new AddCommentReplies({
        content: 'this is a comment reply',
      });

      await commentRepliesRepositoryPostgres.postCommentReplies({
        ...addCommentReplies,
        commentId: 'comment-1',
        owner: 'user-1',
      });

      // Action and Assert
      await expect(commentRepliesRepositoryPostgres.verifyCommentRepliesId('reply-1234567890'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('a verifyCommentRepliesOwner function', () => {
    it('should throw authorizationError when payload contain incorrect owner id', async () => {
      // Arrange
      /** add users */
      await UsersTableTestHelper.addUser({
        id: 'user-1',
        username: 'Batman',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-2',
        username: 'Joker',
      });

      /** add thread */
      await ThreadsTableTestHelper.postThread({
        id: 'thread-1',
        owner: 'user-1',
      });

      /** add comment */
      await CommentsTableTestHelper.postComment({
        id: 'comment-1',
        owner: 'user-2',
        threadId: 'thread-1',
      });

      const fakeIdGenerator = () => '1234567890';
      const commentRepliesRepositoryPostgres = new CommentRepliesRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      const addCommentReplies = new AddCommentReplies({
        content: 'this is a comment reply',
      });

      await commentRepliesRepositoryPostgres.postCommentReplies({
        ...addCommentReplies,
        commentId: 'comment-1',
        owner: 'user-1',
      });

      const payload = {
        id: 'reply-1234567890',
        owner: 'user-2',
      };

      // Action and Assert
      await expect(commentRepliesRepositoryPostgres
        .verifyCommentRepliesOwner(payload.id, payload.owner))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw authorizationError when payload contain incorrect owner id', async () => {
      // Arrange
      /** add users */
      await UsersTableTestHelper.addUser({
        id: 'user-1',
        username: 'Batman',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-2',
        username: 'Joker',
      });

      /** add thread */
      await ThreadsTableTestHelper.postThread({
        id: 'thread-1',
        owner: 'user-1',
      });

      /** add comment */
      await CommentsTableTestHelper.postComment({
        id: 'comment-1',
        owner: 'user-2',
        threadId: 'thread-1',
      });

      const fakeIdGenerator = () => '1234567890';
      const commentRepliesRepositoryPostgres = new CommentRepliesRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      const addCommentReplies = new AddCommentReplies({
        content: 'this is a comment reply',
      });

      await commentRepliesRepositoryPostgres.postCommentReplies({
        ...addCommentReplies,
        commentId: 'comment-1',
        owner: 'user-1',
      });

      const payload = {
        id: 'reply-1234567890',
        owner: 'user-1',
      };

      // Action and Assert
      await expect(commentRepliesRepositoryPostgres
        .verifyCommentRepliesOwner(payload.id, payload.owner))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('a deleteCommentReplies function', () => {
    it('should throw error when comment reply cannot be (already) deleted', async () => {
      // Arrange
      /** add users */
      await UsersTableTestHelper.addUser({
        id: 'user-1',
        username: 'Batman',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-2',
        username: 'Joker',
      });

      /** add thread */
      await ThreadsTableTestHelper.postThread({
        id: 'thread-1',
        owner: 'user-1',
      });

      /** add comment */
      await CommentsTableTestHelper.postComment({
        id: 'comment-1',
        owner: 'user-2',
        threadId: 'thread-1',
      });

      /** add comment reply and delete it */
      await CommentRepliesTableTestHelper.postCommentReplies({
        id: 'reply-1',
        content: 'balasan ini telah dihapus',
        commentId: 'comment-1',
        owner: 'user-1',
        isDelete: true,
      });

      const commentRepliesRepositoryPostgres = new CommentRepliesRepositoryPostgres(pool);

      // Action and Assert
      await expect(commentRepliesRepositoryPostgres.deleteCommentReplies('reply-1'))
        .rejects.toThrowError(InvariantError);
    });

    it('should delete comment reply by updating the is_delete', async () => {
      // Arrange
      /** add users */
      await UsersTableTestHelper.addUser({
        id: 'user-1',
        username: 'Batman',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-2',
        username: 'Joker',
      });

      /** add thread */
      await ThreadsTableTestHelper.postThread({
        id: 'thread-1',
        owner: 'user-1',
      });

      /** add comment */
      await CommentsTableTestHelper.postComment({
        id: 'comment-1',
        owner: 'user-2',
        threadId: 'thread-1',
      });

      /** add comment reply */
      const fakeIdGenerator = () => '1234567890';
      const commentRepliesRepositoryPostgres = new CommentRepliesRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      const addCommentReplies = new AddCommentReplies({
        content: 'this is a comment reply',
      });

      await commentRepliesRepositoryPostgres.postCommentReplies({
        ...addCommentReplies,
        commentId: 'comment-1',
        owner: 'user-1',
      });

      // Action
      await commentRepliesRepositoryPostgres.deleteCommentReplies('reply-1234567890');

      // Assert
      expect(await CommentRepliesTableTestHelper.findCommentRepliesById('reply-1234567890'))
        .toHaveLength(0);
      expect(await CommentRepliesTableTestHelper.getDeletedCommentRepliesById('reply-1234567890'))
        .toEqual({
          id: 'reply-1234567890',
          is_delete: true,
        });
    });
  });

  describe('a getCommentRepliesByCommentId function', () => {
    it('should return all replies associated with comment id ', async () => {
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
      const replyOne = {
        id: 'reply-1',
        content: 'Reply number one for Comment number one',
        date: '2023-06-01T07:59:48.766Z',
        commentId: commentOne.id,
        owner: userOne.id,
        isDelete: false,
      };
      const replyTwo = {
        id: 'reply-2',
        content: 'Reply number two for Comment number one',
        date: '2023-06-02T07:59:48.766Z',
        commentId: commentOne.id,
        owner: userTwo.id,
        isDelete: true,
      };
      /** add users */
      await UsersTableTestHelper.addUser(userOne);
      await UsersTableTestHelper.addUser(userTwo);

      /** add thread */
      await ThreadsTableTestHelper.postThread(threadOne);

      /** add comment */
      await CommentsTableTestHelper.postComment(commentOne);

      /** add comment replies */
      await CommentRepliesTableTestHelper.postCommentReplies(replyOne);
      await CommentRepliesTableTestHelper.postCommentReplies(replyTwo);

      const commentRepliesRepositoryPostgres = new CommentRepliesRepositoryPostgres(pool);

      // Action
      const getCommentRepliesByCommentId = await commentRepliesRepositoryPostgres
        .getCommentRepliesByCommentId(commentOne.id);

      // Assert
      expect(getCommentRepliesByCommentId).toStrictEqual([
        {
          id: 'reply-1',
          content: 'Reply number one for Comment number one',
          date: '2023-06-01T07:59:48.766Z',
          username: 'Batman',
          is_delete: false,
        },
        {
          id: 'reply-2',
          content: 'Reply number two for Comment number one',
          date: '2023-06-02T07:59:48.766Z',
          username: 'Robin',
          is_delete: true,
        },
      ]);
    });
  });
});
