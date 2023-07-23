const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentRepliesRepository = require('../../../Domains/replies/CommentRepliesRepository');
const AddCommentReplies = require('../../../Domains/replies/entities/AddCommentReplies');
const AddedCommentReplies = require('../../../Domains/replies/entities/AddedCommentReplies');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentRepliesUseCase = require('../AddCommentRepliesUseCase');

describe('AddCommentRepliesUseCase', () => {
  it('should orchestrating the add comment replies correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'this is a reply for a comment',
      threadId: 'thread-1',
      commentId: 'comment-1',
      owner: 'user-1',
    };

    const mockAddCommentReplies = new AddCommentReplies({
      content: useCasePayload.content,
    });

    const mockAddedCommentReplies = new AddedCommentReplies({
      id: 'reply-1',
      ...useCasePayload,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentRepliesRepository = new CommentRepliesRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepliesRepository.postCommentReplies = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedCommentReplies));

    /** creating use case instance */
    const addCommentRepliesUseCase = new AddCommentRepliesUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentRepliesRepository: mockCommentRepliesRepository,
    });

    // Action
    const addedCommentReplies = await addCommentRepliesUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockCommentRepliesRepository.postCommentReplies).toBeCalledWith({
      ...mockAddCommentReplies,
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner,
    });
    expect(addedCommentReplies).toStrictEqual(new AddedCommentReplies({
      id: 'reply-1',
      content: 'this is a reply for a comment',
      owner: 'user-1',
    }));
  });
});
