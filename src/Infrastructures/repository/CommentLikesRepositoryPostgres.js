const CommentLikesRepository = require('../../Domains/likes/CommentLikesRepository');

class CommentLikesRepositoryPostgres extends CommentLikesRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async checkCommentLike(userId, commentId) {
    const query = {
      text: 'SELECT user_id FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);

    return result.rowCount;
  }

  async putCommentLike(userId, commentId) {
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2) RETURNING user_id, comment_id',
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }

  async putCommentUnlike(userId, commentId) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }

  async likesCountByCommentId(commentId) {
    const query = {
      text: 'SELECT user_id FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rowCount;
  }
}

module.exports = CommentLikesRepositoryPostgres;
