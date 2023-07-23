const CommentRepliesRepository = require('../CommentRepliesRepository');

describe('A CommentRepliesRepository interface', () => {
  it('should throw error when invoke abstract behaviour', async () => {
    // Arrange
    const commentRepliesRepository = new CommentRepliesRepository();

    // Action and Assert
    await expect(commentRepliesRepository.postCommentReplies({})).rejects.toThrowError('COMMENT_REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepliesRepository.verifyCommentRepliesId({})).rejects.toThrowError('COMMENT_REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepliesRepository.verifyCommentRepliesOwner({})).rejects.toThrowError('COMMENT_REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepliesRepository.getCommentRepliesByCommentId({})).rejects.toThrowError('COMMENT_REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepliesRepository.deleteCommentReplies({})).rejects.toThrowError('COMMENT_REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
