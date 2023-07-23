const AddedCommentReplies = require('../AddedCommentReplies');

describe('an AddedCommentReplies entity', () => {
  it('should throw an error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-1',
      content: 'this is a reply to a comment',
    };

    // Action and Assert
    expect(() => new AddedCommentReplies(payload)).toThrowError('ADDED_COMMENT_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw an error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 1234567890,
      content: 'this is a reply to a comment',
      owner: 'user-1',
    };

    // Action and Assert
    expect(() => new AddedCommentReplies(payload)).toThrowError('ADDED_COMMENT_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedCommentReplies object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-1',
      content: 'this is a reply to a comment',
      owner: 'user-1',
    };

    // Action
    const { id, content, owner } = new AddedCommentReplies(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
