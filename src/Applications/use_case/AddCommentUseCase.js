const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, owner } = useCasePayload;
    const addComment = new AddComment(useCasePayload);
    await this._threadRepository.verifyThreadId(threadId);
    return this._commentRepository.postComment({
      ...addComment,
      threadId,
      owner,
    });
  }
}

module.exports = AddCommentUseCase;
