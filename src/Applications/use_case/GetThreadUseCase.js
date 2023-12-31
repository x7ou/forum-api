const GetComment = require('../../Domains/comments/entities/GetComment');
const GetCommentReplies = require('../../Domains/replies/entities/GetCommentReplies');

class GetThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    commentRepliesRepository,
    commentLikesRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentRepliesRepository = commentRepliesRepository;
    this._commentLikesRepository = commentLikesRepository;
  }

  async execute(useCasePayload) {
    const { id } = useCasePayload;
    await this._threadRepository.verifyThreadId(id);
    const thread = await this._threadRepository.getThreadById(id);

    const comments = await this._commentRepository.getCommentsByThreadId(thread.id);

    if (comments) {
      const commentReplies = await Promise.all(comments.map(async (comment) => {
        const modifiedComment = comment.is_delete ? '**komentar telah dihapus**' : comment.content;
        const getComment = new GetComment({ ...comment, content: modifiedComment });
        const likeCount = await this._commentLikesRepository
          .likesCountByCommentId(comment.id);
        const getReplies = await this._commentRepliesRepository
          .getCommentRepliesByCommentId(comment.id);
        if (getReplies) {
          const replies = getReplies.map((reply) => {
            const modifiedReply = comment.is_delete || reply.is_delete ? '**balasan telah dihapus**' : reply.content;
            return new GetCommentReplies({ ...reply, content: modifiedReply });
          });
          return {
            ...getComment, likeCount, replies,
          };
        }
        return { ...getComment, likeCount };
      }));
      thread.comments = commentReplies;
    }
    return thread;
  }
}

module.exports = GetThreadUseCase;
