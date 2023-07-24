const CommentLikesRepository = require('../CommentLikesRepository');

describe('A CommentLikesRepository interace', () => {
  it('should throw error when invoke abstract behaviour', async () => {
    // Arrange
    const commentLikesRepository = new CommentLikesRepository();

    // Action and Assert
    await expect(commentLikesRepository.checkCommentLike({})).rejects.toThrowError('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentLikesRepository.putCommentLike({})).rejects.toThrowError('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentLikesRepository.putCommentUnlike({})).rejects.toThrowError('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentLikesRepository.likesCountByCommentId({})).rejects.toThrowError('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
