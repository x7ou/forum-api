class DeleteCommentUseCase {
  constructor({
    threadRepository,
    commentRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId: id, owner: userId } = useCasePayload;
    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepository.verifyCommentId(id);
    await this._commentRepository.verifyCommentOwner(id, userId);
    await this._commentRepository.deleteComment(id);
  }
}

module.exports = DeleteCommentUseCase;
