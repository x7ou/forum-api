const PutCommentLikesUseCase = require('../../../../Applications/use_case/PutCommentLikesUseCase');

class CommentLikesHandler {
  constructor(container) {
    this._container = container;

    this.putCommentLikesHandler = this.putCommentLikesHandler.bind(this);
  }

  async putCommentLikesHandler(request, h) {
    const putCommentLikesUseCase = this._container.getInstance(PutCommentLikesUseCase.name);
    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;
    await putCommentLikesUseCase.execute({
      threadId, commentId, userId,
    });
    const response = h.response({ status: 'success' });
    response.code(200);
    return response;
  }
}

module.exports = CommentLikesHandler;
