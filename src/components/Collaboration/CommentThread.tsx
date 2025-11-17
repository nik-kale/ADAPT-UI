import React, { useState } from 'react';
import { useCollaboration, Comment } from '@contexts/CollaborationContext';
import { MessageCircle, ThumbsUp, Check, MoreVertical, Trash2, Reply } from 'lucide-react';
import { formatRelativeTime } from '@utils/formatters';

interface CommentThreadProps {
  targetType: 'node' | 'edge' | 'insight' | 'timeline-event' | 'remediation-step';
  targetId: string;
  currentUserId: string;
  currentUserName: string;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  targetType,
  targetId,
  currentUserId,
  currentUserName,
}) => {
  const {
    getCommentsByTarget,
    addComment,
    deleteComment,
    addReaction,
    resolveComment,
  } = useCollaboration();

  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  const allComments = getCommentsByTarget(targetType, targetId);
  const comments = showResolved
    ? allComments
    : allComments.filter(c => !c.isResolved);

  const topLevelComments = comments.filter(c => !c.parentId);
  const getReplies = (commentId: string) => comments.filter(c => c.parentId === commentId);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addComment({
      userId: currentUserId,
      userName: currentUserName,
      content: newComment,
      targetType,
      targetId,
      parentId: replyTo || undefined,
    });

    setNewComment('');
    setReplyTo(null);
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({
    comment,
    isReply = false,
  }) => {
    const [showMenu, setShowMenu] = useState(false);
    const replies = getReplies(comment.id);

    return (
      <div className={`${isReply ? 'ml-12' : ''} mb-4`}>
        <div
          className={`bg-adapt-bg-tertiary rounded-lg p-4 border border-adapt-border ${
            comment.isResolved ? 'opacity-60' : ''
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-adapt-primary flex items-center justify-center text-white text-sm font-semibold">
                {comment.userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-adapt-text-primary">
                  {comment.userName}
                </div>
                <div className="text-xs text-adapt-text-muted">
                  {formatRelativeTime(comment.timestamp)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-adapt-bg-primary rounded"
                aria-label="Comment options"
              >
                <MoreVertical size={16} className="text-adapt-text-muted" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 bg-adapt-bg-secondary border border-adapt-border rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                  {comment.userId === currentUserId && (
                    <button
                      onClick={() => {
                        deleteComment(comment.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-adapt-bg-tertiary flex items-center gap-2 text-red-500"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                  {!comment.isResolved && (
                    <button
                      onClick={() => {
                        resolveComment(comment.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-adapt-bg-tertiary flex items-center gap-2 text-adapt-text-primary"
                    >
                      <Check size={14} />
                      Mark Resolved
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="text-adapt-text-primary text-sm mb-3 whitespace-pre-wrap">
            {comment.content}
          </div>

          {/* Actions Bar */}
          <div className="flex items-center gap-4 text-adapt-text-muted">
            <button
              onClick={() => addReaction(comment.id, '👍', currentUserId)}
              className="flex items-center gap-1 text-xs hover:text-adapt-text-primary transition-colors"
            >
              <ThumbsUp size={14} />
              {comment.reactions?.['👍']?.length || 0}
            </button>

            <button
              onClick={() => setReplyTo(comment.id)}
              className="flex items-center gap-1 text-xs hover:text-adapt-text-primary transition-colors"
            >
              <Reply size={14} />
              Reply
            </button>

            {comment.isResolved && (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <Check size={14} />
                Resolved
              </span>
            )}
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="mt-2">
            {replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}

        {/* Reply Input */}
        {replyTo === comment.id && (
          <div className="ml-12 mt-2">
            <div className="bg-adapt-bg-secondary rounded-lg p-3 border border-adapt-border">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder={`Reply to ${comment.userName}...`}
                className="w-full bg-adapt-bg-tertiary border border-adapt-border rounded px-3 py-2 text-sm text-adapt-text-primary placeholder-adapt-text-muted focus:outline-none focus:ring-2 focus:ring-adapt-primary resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddComment}
                  className="px-3 py-1 bg-adapt-primary text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment('');
                  }}
                  className="px-3 py-1 bg-adapt-bg-tertiary text-adapt-text-primary rounded text-sm hover:bg-adapt-bg-primary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-adapt-bg-secondary rounded-lg border border-adapt-border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-adapt-primary" />
          <h3 className="text-lg font-semibold text-adapt-text-primary">
            Comments ({comments.length})
          </h3>
        </div>

        <label className="flex items-center gap-2 text-sm text-adapt-text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={e => setShowResolved(e.target.checked)}
            className="rounded"
          />
          Show resolved
        </label>
      </div>

      {/* New Comment */}
      {!replyTo && (
        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full bg-adapt-bg-tertiary border border-adapt-border rounded-lg px-4 py-3 text-adapt-text-primary placeholder-adapt-text-muted focus:outline-none focus:ring-2 focus:ring-adapt-primary resize-none"
            rows={3}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="mt-2 px-4 py-2 bg-adapt-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Comment
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <div className="text-center py-8 text-adapt-text-muted">
            <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          topLevelComments.map(comment => <CommentItem key={comment.id} comment={comment} />)
        )}
      </div>
    </div>
  );
};
