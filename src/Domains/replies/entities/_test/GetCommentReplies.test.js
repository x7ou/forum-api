const GetCommentReplies = require('../GetCommentReplies');

describe('a GetCommentReplies entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-1',
      content: 'I Am Batman',
      username: 'Batman',
    };

    // Action and Assert
    expect(() => new GetCommentReplies(payload)).toThrowError('GET_COMMENT_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 1,
      content: 'I am Batman',
      date: '2023-06-01T07:59:48.766Z',
      username: 'Batman',
    };

    // Action and Assert
    expect(() => new GetCommentReplies(payload)).toThrowError('GET_COMMENT_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-1',
      content: 'I am Batman',
      date: '2023-06-01T07:59:48.766Z',
      username: 'Batman',
    };

    // Action
    const {
      id, content, date, username,
    } = new GetCommentReplies(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });
});
