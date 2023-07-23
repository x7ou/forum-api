const GetComment = require('../GetComment');

describe('A GetComment entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-1234567890',
      date: '2023-06-06T07:22:33.555Z',
      content: 'any comment',
    };

    // Action and Assert
    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-1234567890',
      username: true,
      date: '2023-06-06T07:22:33.555Z',
      content: {},
    };

    // Action and Assert
    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-1234567890',
      username: 'theBatman',
      date: '2023-06-06T07:22:33.555Z',
      content: 'I am Batman',
    };

    // Action
    const {
      id, username, date, content,
    } = new GetComment(payload);
    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
  });
});
