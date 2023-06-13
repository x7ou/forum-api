const AddThread = require('../AddThread');

describe('An AddThread entity', () => {
  it('should throw an error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'any title',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw an error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 5758,
      body: 'any body',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddThread object corectly', () => {
    // Arrange
    const payload = {
      title: 'any title',
      body: 'any body',
    };

    // Action
    const { title, body } = new AddThread(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
  });
});
