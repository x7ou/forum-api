const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentLikesRepository = require('../../../Domains/likes/CommentLikesRepository');
const CommentRepliesRepository = require('../../../Domains/replies/CommentRepliesRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThread = require('../../../Domains/threads/entities/GetThread');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should orchestrating get all thread detail correctly', async () => {
    // Arrange
    const useCasePayload = {
      id: 'thread-1',
    };
    const mockedThread = new GetThread({
      id: useCasePayload.id,
      title: 'this is a thread title',
      body: 'this is a thread body',
      date: '2023-06-01T07:59:18.982Z',
      username: 'Batman',
    });
    const mockedComment = [
      {
        id: 'comment-1',
        content: 'this is a comment for a thread',
        date: '2023-06-02T07:59:18.982Z',
        username: 'Robin',
        is_delete: false,
      },
    ];
    const mockedCommentReplies = [
      {
        id: 'reply-1',
        content: 'this is a reply for a comment',
        date: '2023-06-03T07:59:18.982Z',
        username: 'Joker',
        is_delete: false,
      },
    ];
    const mockedCommentLikesCount = 2;

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentRepliesRepository = new CommentRepliesRepository();
    const mockCommentLikesRepository = new CommentLikesRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedComment));
    mockCommentRepliesRepository.getCommentRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedCommentReplies));
    mockCommentLikesRepository.likesCountByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedCommentLikesCount));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentRepliesRepository: mockCommentRepliesRepository,
      commentLikesRepository: mockCommentLikesRepository,
    });

    // Action
    const getThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(getThread).toEqual({
      id: 'thread-1',
      title: 'this is a thread title',
      body: 'this is a thread body',
      date: '2023-06-01T07:59:18.982Z',
      username: 'Batman',
      comments: [
        {
          id: 'comment-1',
          content: 'this is a comment for a thread',
          date: '2023-06-02T07:59:18.982Z',
          username: 'Robin',
          likeCount: 2,
          replies: [
            {
              id: 'reply-1',
              content: 'this is a reply for a comment',
              date: '2023-06-03T07:59:18.982Z',
              username: 'Joker',
            },
          ],
        },
      ],
    });
    expect(mockThreadRepository.verifyThreadId)
      .toHaveBeenCalledWith(useCasePayload.id);
    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith(useCasePayload.id);
    expect(mockCommentRepository.getCommentsByThreadId)
      .toHaveBeenCalledWith(useCasePayload.id);
    expect(mockCommentRepliesRepository.getCommentRepliesByCommentId)
      .toHaveBeenCalledWith(mockedComment[0].id);
    expect(mockCommentLikesRepository.likesCountByCommentId)
      .toHaveBeenCalledWith(mockedComment[0].id);
  });

  it('should orchestrating get all thread detail with deleted comment correctly', async () => {
    // Arrange
    const useCasePayload = {
      id: 'thread-1',
    };
    const mockedThread = new GetThread({
      id: useCasePayload.id,
      title: 'this is a thread title',
      body: 'this is a thread body',
      date: '2023-06-01T07:59:18.982Z',
      username: 'Batman',
    });
    const mockedComment = [
      {
        id: 'comment-1',
        content: 'this is a comment for a thread',
        date: '2023-06-02T07:59:18.982Z',
        username: 'Robin',
        is_delete: true,
      },
    ];
    const mockedCommentReplies = [
      {
        id: 'reply-1',
        content: 'this is a reply for a comment',
        date: '2023-06-03T07:59:18.982Z',
        username: 'Joker',
        is_delete: true,
      },
    ];
    const mockedCommentLikesCount = 2;

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentRepliesRepository = new CommentRepliesRepository();
    const mockCommentLikesRepository = new CommentLikesRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedComment));
    mockCommentRepliesRepository.getCommentRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedCommentReplies));
    mockCommentLikesRepository.likesCountByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedCommentLikesCount));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentRepliesRepository: mockCommentRepliesRepository,
      commentLikesRepository: mockCommentLikesRepository,
    });

    // Action
    const getThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(getThread).toEqual({
      id: 'thread-1',
      title: 'this is a thread title',
      body: 'this is a thread body',
      date: '2023-06-01T07:59:18.982Z',
      username: 'Batman',
      comments: [
        {
          id: 'comment-1',
          content: '**komentar telah dihapus**',
          date: '2023-06-02T07:59:18.982Z',
          username: 'Robin',
          likeCount: 2,
          replies: [
            {
              id: 'reply-1',
              content: '**balasan telah dihapus**',
              date: '2023-06-03T07:59:18.982Z',
              username: 'Joker',
            },
          ],
        },
      ],
    });
    expect(mockThreadRepository.verifyThreadId)
      .toHaveBeenCalledWith(useCasePayload.id);
    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith(useCasePayload.id);
    expect(mockCommentRepository.getCommentsByThreadId)
      .toHaveBeenCalledWith(useCasePayload.id);
    expect(mockCommentRepliesRepository.getCommentRepliesByCommentId)
      .toHaveBeenCalledWith(mockedComment[0].id);
    expect(mockCommentLikesRepository.likesCountByCommentId)
      .toHaveBeenCalledWith(mockedComment[0].id);
  });

  it('should orchestrating get all thread detail without replies correctly', async () => {
    // Arrange
    const useCasePayload = {
      id: 'thread-1',
    };
    const mockedThread = new GetThread({
      id: useCasePayload.id,
      title: 'this is a thread title',
      body: 'this is a thread body',
      date: '2023-06-01T07:59:18.982Z',
      username: 'Batman',
    });
    const mockedComment = [
      {
        id: 'comment-1',
        content: 'this is a comment for a thread',
        date: '2023-06-02T07:59:18.982Z',
        username: 'Robin',
        is_delete: false,
      },
    ];
    const mockedCommentLikesCount = 2;

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentRepliesRepository = new CommentRepliesRepository();
    const mockCommentLikesRepository = new CommentLikesRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedComment));
    mockCommentRepliesRepository.getCommentRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikesRepository.likesCountByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedCommentLikesCount));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentRepliesRepository: mockCommentRepliesRepository,
      commentLikesRepository: mockCommentLikesRepository,
    });

    // Action
    const getThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(getThread).toEqual({
      id: 'thread-1',
      title: 'this is a thread title',
      body: 'this is a thread body',
      date: '2023-06-01T07:59:18.982Z',
      username: 'Batman',
      comments: [
        {
          id: 'comment-1',
          content: 'this is a comment for a thread',
          date: '2023-06-02T07:59:18.982Z',
          username: 'Robin',
          likeCount: 2,
        },
      ],
    });
    expect(mockThreadRepository.verifyThreadId)
      .toHaveBeenCalledWith(useCasePayload.id);
    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith(useCasePayload.id);
    expect(mockCommentRepository.getCommentsByThreadId)
      .toHaveBeenCalledWith(useCasePayload.id);
    expect(mockCommentRepliesRepository.getCommentRepliesByCommentId)
      .toHaveBeenCalledWith(mockedComment[0].id);
    expect(mockCommentLikesRepository.likesCountByCommentId)
      .toHaveBeenCalledWith(mockedComment[0].id);
  });

  it('should orchestrating get all thread detail without comments correctly', async () => {
    // Arrange
    const useCasePayload = {
      id: 'thread-1',
    };
    const mockedThread = new GetThread({
      id: useCasePayload.id,
      title: 'this is a thread title',
      body: 'this is a thread body',
      date: '2023-06-01T07:59:18.982Z',
      username: 'Batman',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentRepliesRepository = new CommentRepliesRepository();
    const mockCommentLikesRepository = new CommentLikesRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepliesRepository.getCommentRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikesRepository.likesCountByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentRepliesRepository: mockCommentRepliesRepository,
      commentLikesRepository: mockCommentLikesRepository,
    });

    // Action
    const getThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(getThread).toEqual({
      id: 'thread-1',
      title: 'this is a thread title',
      body: 'this is a thread body',
      date: '2023-06-01T07:59:18.982Z',
      username: 'Batman',
    });
    expect(mockThreadRepository.verifyThreadId)
      .toHaveBeenCalledWith(useCasePayload.id);
    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith(useCasePayload.id);
    expect(mockCommentRepository.getCommentsByThreadId)
      .toHaveBeenCalledWith(useCasePayload.id);
    expect(mockCommentRepliesRepository.getCommentRepliesByCommentId)
      .not.toHaveBeenCalledWith();
    expect(mockCommentLikesRepository.likesCountByCommentId)
      .not.toHaveBeenCalledWith();
  });
});
