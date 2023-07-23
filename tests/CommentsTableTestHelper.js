/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async postComment({
    id = 'comment-1234567890', content = 'test comment', date = 'some date', threadId = 'thread-1234567890', owner = 'user-123', isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, date, threadId, owner, isDelete],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND is_delete = false',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async getDeletedCommentById(id) {
    const query = {
      text: 'SELECT id, is_delete FROM comments WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
