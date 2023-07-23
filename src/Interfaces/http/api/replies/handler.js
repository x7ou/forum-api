const AddCommentRepliesUseCase = require('../../../../Applications/use_case/AddCommentRepliesUseCase');
const DeleteCommentRepliesUseCase = require('../../../../Applications/use_case/DeleteCommentRepliesUseCase');

class CommentRepliesHandler {
  constructor(container) {
    this._container = container;

    this.postCommentRepliesHandler = this.postCommentRepliesHandler.bind(this);
    this.deleteCommentRepliesHandler = this.deleteCommentRepliesHandler.bind(this);
  }

  async postCommentRepliesHandler(request, h) {
    const addCommentRepliesUseCase = this._container.getInstance(AddCommentRepliesUseCase.name);
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;
    const addedReply = await addCommentRepliesUseCase.execute({
      ...request.payload,
      threadId,
      commentId,
      owner,
    });
    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentRepliesHandler(request, h) {
    const deleteCommentRepliesUseCase = this._container
      .getInstance(DeleteCommentRepliesUseCase.name);
    const { threadId, commentId, replyId } = request.params;
    const { id: owner } = request.auth.credentials;

    await deleteCommentRepliesUseCase.execute({
      threadId, commentId, replyId, owner,
    });

    const response = h.response({ status: 'success' });
    response.code(200);
    return response;
  }
}

module.exports = CommentRepliesHandler;
