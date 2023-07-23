class DeleteCommentRepliesUseCase {
  constructor({
    threadRepository,
    commentRepository,
    commentRepliesRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentRepliesRepository = commentRepliesRepository;
  }

  async execute(useCasePayload) {
    const {
      threadId, commentId, replyId, owner,
    } = useCasePayload;

    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepository.verifyCommentId(commentId);
    await this._commentRepliesRepository.verifyCommentRepliesId(replyId);
    await this._commentRepliesRepository.verifyCommentRepliesOwner(replyId, owner);
    await this._commentRepliesRepository.deleteCommentReplies(replyId);
  }
}

module.exports = DeleteCommentRepliesUseCase;
