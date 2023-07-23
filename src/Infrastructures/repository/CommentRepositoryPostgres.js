const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async postComment(addComment) {
    const { content, threadId, owner } = addComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date();

    const query = {
      text: `INSERT INTO comments 
              VALUES($1, $2, $3, $4, $5) 
              RETURNING id, content, user_id AS owner`,
      values: [id, content, date, threadId, owner],
    };

    const result = await this._pool.query(query);

    return new AddedComment(result.rows[0]);
  }

  async verifyCommentId(id) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND is_delete = false',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, comments.content, comments.date, comments.is_delete, users.username 
        FROM comments JOIN users 
        ON thread_id = $1 AND comments.user_id = users.id 
        ORDER BY comments.date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async verifyCommentOwner(id, userId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND is_delete = false AND user_id = $2',
      values: [id, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('anda tidak memiliki otorisasi untuk menghapus comment ini');
    }
  }

  async deleteComment(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 AND is_delete = false RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('tidak dapat menghapus comment');
    }
  }
}

module.exports = CommentRepositoryPostgres;
