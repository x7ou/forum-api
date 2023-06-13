const ThreadRepository = require('../ThreadRepository');

describe('A ThreadRepository interface', () => {
  it('should throw error when invoke abstract behaviour', async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Action and Assert
    await expect(threadRepository.postThread({})).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
