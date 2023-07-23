const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentRepliesRepository = require('../../../Domains/replies/CommentRepliesRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentRepliesUseCase = require('../DeleteCommentRepliesUseCase');

describe('DeleteCommentRepliesUseCase', () => {
  it('should orchestrating delete comment reply correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-1',
      commentId: 'comment-1',
      replyId: 'reply-1',
      owner: 'user-1',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentRepliesRepository = new CommentRepliesRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepliesRepository.verifyCommentRepliesId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepliesRepository.verifyCommentRepliesOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepliesRepository.deleteCommentReplies = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteCommentRepliesUseCase = new DeleteCommentRepliesUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentRepliesRepository: mockCommentRepliesRepository,
    });

    // Action
    await deleteCommentRepliesUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadId)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentId)
      .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockCommentRepliesRepository.verifyCommentRepliesId)
      .toHaveBeenCalledWith(useCasePayload.replyId);
    expect(mockCommentRepliesRepository.verifyCommentRepliesOwner)
      .toHaveBeenCalledWith(useCasePayload.replyId, useCasePayload.owner);
    expect(mockCommentRepliesRepository.deleteCommentReplies)
      .toHaveBeenCalledWith(useCasePayload.replyId);
  });
});
