const AddedThread = require('../AddedThread');

describe('Am AddedThread entity', () => {
  it('should throw an error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'any title',
      owner: 'any owner',
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: true,
      title: 'any title',
      owner: 1234567890,
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'abcd1234',
      title: 'any title',
      owner: 'any owner',
    };

    // Action
    const { id, title, owner } = new AddedThread(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(owner).toEqual(payload.owner);
  });
});
