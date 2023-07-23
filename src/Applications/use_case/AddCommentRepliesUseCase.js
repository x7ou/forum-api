const AddCommentReplies = require('../../Domains/replies/entities/AddCommentReplies');

class AddCommentRepliesUseCase {
  constructor({
    threadRepository, commentRepository, commentRepliesRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentRepliesRepository = commentRepliesRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = useCasePayload;
    const addCommentReplies = new AddCommentReplies(useCasePayload);
    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepository.verifyCommentId(commentId);
    return this._commentRepliesRepository.postCommentReplies({
      ...addCommentReplies,
      commentId,
      owner,
    });
  }
}

module.exports = AddCommentRepliesUseCase;
