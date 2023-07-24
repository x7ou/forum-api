class PutCommentLikesUseCase {
  constructor({
    threadRepository,
    commentRepository,
    commentLikesRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepositoryy = commentRepository;
    this._commentLikesRepository = commentLikesRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId } = useCasePayload;
    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepositoryy.verifyCommentId(commentId);
    const isLiked = await this._commentLikesRepository.checkCommentLike(userId, commentId);
    if (!isLiked) {
      await this._commentLikesRepository.putCommentLike(userId, commentId);
    } else {
      await this._commentLikesRepository.putCommentUnlike(userId, commentId);
    }
  }
}

module.exports = PutCommentLikesUseCase;
