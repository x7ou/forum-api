const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'any title',
      body: 'any body',
      owner: 'user-1234567890',
    };
    const mockAddThread = new AddThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
    });
    const mockAddedThread = new AddedThread({
      id: 'thread-1234567890',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.postThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    /** creating use case instance */
    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.postThread).toBeCalledWith({
      ...mockAddThread,
      owner: useCasePayload.owner,
    });
    expect(addedThread).toStrictEqual(new AddedThread({
      id: 'thread-1234567890',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    }));
  });
});
