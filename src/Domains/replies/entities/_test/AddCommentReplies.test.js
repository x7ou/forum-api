const AddCommentReplies = require('../AddCommentReplies');

describe('an AddCommentReplies entity', () => {
  it('should return an error when payload did not conatain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new AddCommentReplies(payload)).toThrowError('ADD_COMMENT_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should return an error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 1234567890,
    };

    // Action and Assert
    expect(() => new AddCommentReplies(payload)).toThrowError('ADD_COMMENT_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddCommentReplies object correctly', () => {
    // Arrange
    const payload = {
      content: 'this is a reply to a comment',
    };

    // Action
    const { content } = new AddCommentReplies(payload);

    // Assert
    expect(content).toEqual(payload.content);
  });
});
