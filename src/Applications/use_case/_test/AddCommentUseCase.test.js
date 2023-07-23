const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-1234567890',
      content: 'any content',
      owner: 'user-1234567890',
    };

    const mockAddComment = new AddComment({
      content: useCasePayload.content,
    });

    const mockAddedComment = new AddedComment({
      id: 'comment-1234567890',
      ...useCasePayload,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.postComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.postComment).toBeCalledWith({
      ...mockAddComment,
      threadId: useCasePayload.threadId,
      owner: useCasePayload.owner,
    });
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-1234567890',
      ...useCasePayload,
    }));
  });
});
