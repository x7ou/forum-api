/* eslint-disable no-unused-vars */
class CommentLikesRepository {
  async checkCommentLike(userId, commentId) {
    throw new Error('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async putCommentLike(userId, commentId) {
    throw new Error('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async putCommentUnlike(userId, commentId) {
    throw new Error('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async likesCountByCommentId(commentId) {
    throw new Error('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = CommentLikesRepository;
