import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Collaboration Context for Real-time Features
 * Supports: Comments, Annotations, Presence, Activity Feed
 */

// Types
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  targetType: 'node' | 'edge' | 'insight' | 'timeline-event' | 'remediation-step';
  targetId: string;
  mentions?: string[];
  reactions?: Record<string, string[]>; // emoji -> userIds
  isResolved?: boolean;
  parentId?: string; // For threaded replies
}

export interface Annotation {
  id: string;
  userId: string;
  userName: string;
  type: 'highlight' | 'circle' | 'arrow' | 'text';
  targetId: string;
  position: { x: number; y: number };
  content?: string;
  color: string;
  timestamp: Date;
}

export interface UserPresence {
  userId: string;
  userName: string;
  userAvatar?: string;
  location: string; // 'graph', 'timeline', 'chat', etc.
  cursor?: { x: number; y: number };
  lastActive: Date;
  status: 'active' | 'idle' | 'offline';
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  type: 'comment' | 'annotation' | 'status-change' | 'assignment' | 'resolution';
  description: string;
  timestamp: Date;
  targetType?: string;
  targetId?: string;
}

interface CollaborationContextType {
  // Comments
  comments: Comment[];
  addComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  deleteComment: (id: string) => void;
  getCommentsByTarget: (targetType: string, targetId: string) => Comment[];
  addReaction: (commentId: string, emoji: string, userId: string) => void;
  resolveComment: (id: string) => void;

  // Annotations
  annotations: Annotation[];
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'timestamp'>) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  getAnnotationsByTarget: (targetId: string) => Annotation[];

  // Presence
  users: UserPresence[];
  updatePresence: (userId: string, updates: Partial<UserPresence>) => void;
  getActiveUsers: () => UserPresence[];

  // Activity Feed
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  getRecentActivities: (limit?: number) => Activity[];
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within CollaborationProvider');
  }
  return context;
};

export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Comments
  const addComment = useCallback((comment: Omit<Comment, 'id' | 'timestamp'>) => {
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setComments(prev => [...prev, newComment]);

    // Add to activity feed
    addActivity({
      userId: comment.userId,
      userName: comment.userName,
      type: 'comment',
      description: `commented on ${comment.targetType}`,
      targetType: comment.targetType,
      targetId: comment.targetId,
    });
  }, []);

  const updateComment = useCallback((id: string, updates: Partial<Comment>) => {
    setComments(prev =>
      prev.map(comment => (comment.id === id ? { ...comment, ...updates } : comment))
    );
  }, []);

  const deleteComment = useCallback((id: string) => {
    setComments(prev => prev.filter(comment => comment.id !== id));
  }, []);

  const getCommentsByTarget = useCallback(
    (targetType: string, targetId: string) => {
      return comments.filter(
        comment => comment.targetType === targetType && comment.targetId === targetId
      );
    },
    [comments]
  );

  const addReaction = useCallback((commentId: string, emoji: string, userId: string) => {
    setComments(prev =>
      prev.map(comment => {
        if (comment.id === commentId) {
          const reactions = { ...comment.reactions };
          if (!reactions[emoji]) {
            reactions[emoji] = [];
          }
          if (!reactions[emoji].includes(userId)) {
            reactions[emoji] = [...reactions[emoji], userId];
          }
          return { ...comment, reactions };
        }
        return comment;
      })
    );
  }, []);

  const resolveComment = useCallback((id: string) => {
    updateComment(id, { isResolved: true });
  }, [updateComment]);

  // Annotations
  const addAnnotation = useCallback((annotation: Omit<Annotation, 'id' | 'timestamp'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setAnnotations(prev => [...prev, newAnnotation]);

    addActivity({
      userId: annotation.userId,
      userName: annotation.userName,
      type: 'annotation',
      description: `added ${annotation.type} annotation`,
      targetId: annotation.targetId,
    });
  }, []);

  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    setAnnotations(prev =>
      prev.map(annotation => (annotation.id === id ? { ...annotation, ...updates } : annotation))
    );
  }, []);

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(annotation => annotation.id !== id));
  }, []);

  const getAnnotationsByTarget = useCallback(
    (targetId: string) => {
      return annotations.filter(annotation => annotation.targetId === targetId);
    },
    [annotations]
  );

  // Presence
  const updatePresence = useCallback((userId: string, updates: Partial<UserPresence>) => {
    setUsers(prev => {
      const existing = prev.find(u => u.userId === userId);
      if (existing) {
        return prev.map(u =>
          u.userId === userId ? { ...u, ...updates, lastActive: new Date() } : u
        );
      } else {
        return [
          ...prev,
          {
            userId,
            userName: updates.userName || 'Unknown User',
            location: updates.location || 'unknown',
            lastActive: new Date(),
            status: 'active',
            ...updates,
          } as UserPresence,
        ];
      }
    });
  }, []);

  const getActiveUsers = useCallback(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return users.filter(user => user.lastActive > fiveMinutesAgo && user.status === 'active');
  }, [users]);

  // Activity Feed
  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 100)); // Keep last 100 activities
  }, []);

  const getRecentActivities = useCallback(
    (limit: number = 20) => {
      return activities.slice(0, limit);
    },
    [activities]
  );

  // Cleanup idle users periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      setUsers(prev =>
        prev.map(user =>
          user.lastActive < fiveMinutesAgo ? { ...user, status: 'idle' as const } : user
        )
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const value: CollaborationContextType = {
    comments,
    addComment,
    updateComment,
    deleteComment,
    getCommentsByTarget,
    addReaction,
    resolveComment,
    annotations,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    getAnnotationsByTarget,
    users,
    updatePresence,
    getActiveUsers,
    activities,
    addActivity,
    getRecentActivities,
  };

  return <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>;
};
