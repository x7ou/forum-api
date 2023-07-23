const GetThread = require('../GetThread');

describe('A GetThread entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-1234567890',
      title: 'any thread',
      body: 'any body',
      username: 'anyuser',
    };

    // Action and Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-1234567890',
      title: {},
      body: 'any body',
      date: '2023-06-01T07:19:09.775Z',
      username: 'anyuser',
    };

    // Action and Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-1234567890',
      title: 'any thread',
      body: 'any body',
      date: '2023-06-01T07:19:09.775Z',
      username: 'anyuser',
    };

    // Action
    const {
      id, title, body, date, username,
    } = new GetThread(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });
});
