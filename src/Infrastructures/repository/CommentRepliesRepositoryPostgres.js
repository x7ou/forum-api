const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepliesRepository = require('../../Domains/replies/CommentRepliesRepository');
const AddedCommentReplies = require('../../Domains/replies/entities/AddedCommentReplies');

class CommentRepliesRepositoryPostgres extends CommentRepliesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async postCommentReplies(addCommentReplies) {
    const { content, commentId, owner } = addCommentReplies;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date();

    const query = {
      text: 'INSERT INTO comment_replies VALUES($1, $2, $3, $4, $5) returning id, content, user_id AS owner',
      values: [id, content, date, commentId, owner],
    };

    const result = await this._pool.query(query);
    return new AddedCommentReplies(result.rows[0]);
  }

  async verifyCommentRepliesId(id) {
    const query = {
      text: 'SELECT id FROM comment_replies WHERE id = $1 AND is_delete = false',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }

  async verifyCommentRepliesOwner(id, owner) {
    const query = {
      text: 'SELECT id FROM comment_replies WHERE id = $1 AND user_id = $2 AND is_delete = false',
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('anda tidak memiliki otorisasi atas balasan ini');
    }
  }

  async getCommentRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT comment_replies.id, comment_replies.content, comment_replies.date, comment_replies.is_delete, users.username 
              FROM comment_replies JOIN users 
              ON comment_id = $1 AND comment_replies.user_id = users.id 
              ORDER BY comment_replies.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deleteCommentReplies(id) {
    const query = {
      text: 'UPDATE comment_replies SET is_delete = true WHERE id = $1 AND is_delete = false RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('tidak dapat menghapus balasan');
    }
  }
}

module.exports = CommentRepliesRepositoryPostgres;
