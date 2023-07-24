const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentLikesRepository = require('../../../Domains/likes/CommentLikesRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const PutCommentLikesUseCase = require('../PutCommentLikesUseCase');

describe('PutCommentLikesUseCase', () => {
  it('should orchestrating put comment like correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-1',
      commentId: 'comment-1',
      userId: 'user-1',
    };

    /** creating dependencyy of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikesRepository = new CommentLikesRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikesRepository.checkCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve(0));
    mockCommentLikesRepository.putCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const putCommentLikesUseCase = new PutCommentLikesUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikesRepository: mockCommentLikesRepository,
    });

    // Action
    await putCommentLikesUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockCommentLikesRepository.checkCommentLike).toBeCalledWith(
      useCasePayload.userId,
      useCasePayload.commentId,
    );
    expect(mockCommentLikesRepository.putCommentLike).toBeCalledWith(
      useCasePayload.userId,
      useCasePayload.commentId,
    );
  });

  it('should orchestrating put comment unlike correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-2',
      commentId: 'comment-2',
      userId: 'user-2',
    };

    /** creating dependencyy of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikesRepository = new CommentLikesRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikesRepository.checkCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve(1));
    mockCommentLikesRepository.putCommentUnlike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const putCommentLikeUseCase = new PutCommentLikesUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikesRepository: mockCommentLikesRepository,
    });

    // Action
    await putCommentLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockCommentLikesRepository.checkCommentLike).toBeCalledWith(
      useCasePayload.userId,
      useCasePayload.commentId,
    );
    expect(mockCommentLikesRepository.putCommentUnlike).toBeCalledWith(
      useCasePayload.userId,
      useCasePayload.commentId,
    );
  });
});
