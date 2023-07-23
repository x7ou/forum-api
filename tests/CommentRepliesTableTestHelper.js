/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentRepliesTableTestHelper = {
  async postCommentReplies({
    id = 'reply-1234567890', content = 'test comment replies', date = 'some date', commentId = 'comment-1234567890', owner = 'user-123', isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO comment_replies VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, date, commentId, owner, isDelete],
    };

    await pool.query(query);
  },

  async findCommentRepliesById(id) {
    const query = {
      text: 'SELECT id FROM comment_replies WHERE id = $1 AND is_delete = false',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async getDeletedCommentRepliesById(id) {
    const query = {
      text: 'SELECT id, is_delete FROM comment_replies WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentRepliesTableTestHelper;
