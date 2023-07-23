const AddedComment = require('../AddedComment');

describe('An AddedComment entity', () => {
  it('should throw an error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-1234567890',
      owner: 'user-1234567890',
    };

    // Action and Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw an error when payload did not meet data specification', () => {
    // Arrange
    const payload = {
      id: 'comnment-1234567890',
      content: 234,
      owner: 'user-1234567890',
    };

    // Acttion and Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_SPECIFICATION');
  });

  it('should create AddedComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-1234567890',
      content: 'any comment',
      owner: 'user-1234567890',
    };

    // Action
    const { id, content, owner } = new AddedComment(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
