/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikesTableTestHelper = {
  async putCommentLike({
    userId = 'user-1', commentId = 'comment-1',
  }) {
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2) RETURNING user_id, comment_id ',
      values: [userId, commentId],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async putCommentUnlike({
    userId = 'user-1', commentId = 'comment-1',
  }) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    await pool.query(query);
  },

  async checkCommentLike({
    userId = 'user-1', commentId = 'comment-1',
  }) {
    const query = {
      text: 'SELECT user_id FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await pool.query(query);
    return result.rowCount;
  },

  async checkAddedCommentLike({
    userId = 'user-1', commentId = 'comment-1',
  }) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentLikesTableTestHelper;
