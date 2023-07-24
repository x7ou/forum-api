const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentLikesRepositoryPostgres = require('../CommentLikesRepositoryPostgres');
const pool = require('../../database/postgres/pool');

describe('CommentLikesRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('a checkCommentLike function', () => {
    it('should return 0 if a comment has not been liked by a user yet', async () => {
      // Arrange
      /** add users */
      await UsersTableTestHelper.addUser({
        id: 'user-1',
        username: 'Batman',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-2',
        username: 'Riddler',
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

      const commentLikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool);

      // Action
      const isLiked = await commentLikesRepositoryPostgres.checkCommentLike('user-1', 'comment-1');

      // Assert
      expect(isLiked).toEqual(0);
    });

    it('should return 1 if a comment has been liked by a user', async () => {
      // Arrange
      /** add users */
      await UsersTableTestHelper.addUser({
        id: 'user-1',
        username: 'Batman',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-2',
        username: 'Riddler',
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

      /** put like */
      await CommentLikesTableTestHelper.putCommentLike({
        userId: 'user-1',
        commentId: 'comment-1',
      });

      const commentLikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool);

      // Action
      const isLiked = await commentLikesRepositoryPostgres.checkCommentLike('user-1', 'comment-1');

      // Assert
      expect(isLiked).toEqual(1);
    });
  });

  describe('a putCommentLike function', () => {
    it('should persist put comment like and return comment like correctly', async () => {
      // Arrange
      /** add users */
      await UsersTableTestHelper.addUser({
        id: 'user-1',
        username: 'Batman',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-2',
        username: 'Riddler',
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

      const commentLikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool);

      // Action
      await commentLikesRepositoryPostgres.putCommentLike('user-1', 'comment-1');

      // Assert
      const isLiked = await CommentLikesTableTestHelper.checkAddedCommentLike({
        userId: 'user-1',
        commentId: 'comment-1',
      });
      expect(isLiked).toHaveLength(1);
    });
  });

  describe('a putCommentUnlike function', () => {
    it('should persist put comment unlike and return comment unlike correctly', async () => {
      // Arrange
      /** add users */
      await UsersTableTestHelper.addUser({
        id: 'user-1',
        username: 'Batman',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-2',
        username: 'Riddler',
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

      /** like a comment */
      await CommentLikesTableTestHelper.putCommentLike({
        userId: 'user-1',
        commentId: 'comment-1',
      });

      const commentLikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool);

      // Action
      await commentLikesRepositoryPostgres.putCommentUnlike('user-1', 'comment-1');

      // Assert
      const isLiked = await CommentLikesTableTestHelper.checkAddedCommentLike({
        userId: 'user-1',
        commentId: 'comment-1',
      });
      expect(isLiked).toHaveLength(0);
    });
  });

  describe('a likesCountByCommentId function', () => {
    it('should return number of likes of a comment correctly', async () => {
      // Arrange
      /** add users */
      await UsersTableTestHelper.addUser({
        id: 'user-1',
        username: 'Batman',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-2',
        username: 'Riddler',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-3',
        username: 'Bane',
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

      /** like a comment */
      await CommentLikesTableTestHelper.putCommentLike({
        userId: 'user-1',
        commentId: 'comment-1',
      });

      await CommentLikesTableTestHelper.putCommentLike({
        userId: 'user-2',
        commentId: 'comment-1',
      });

      await CommentLikesTableTestHelper.putCommentLike({
        userId: 'user-3',
        commentId: 'comment-1',
      });

      const commentLikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool);

      // Action
      const likesCount = await commentLikesRepositoryPostgres.likesCountByCommentId('comment-1');

      // Assert
      expect(likesCount).toEqual(3);
    });
  });
});
