import React from 'react';
import { useCollaboration } from '@contexts/CollaborationContext';
import { Activity as ActivityIcon, MessageCircle, Edit, CheckCircle, UserPlus } from 'lucide-react';
import { formatRelativeTime } from '@utils/formatters';

export const ActivityFeed: React.FC<{ limit?: number }> = ({ limit = 20 }) => {
  const { getRecentActivities } = useCollaboration();
  const activities = getRecentActivities(limit);

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return MessageCircle;
      case 'annotation':
        return Edit;
      case 'resolution':
        return CheckCircle;
      case 'assignment':
        return UserPlus;
      default:
        return ActivityIcon;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'comment':
        return 'text-blue-500';
      case 'annotation':
        return 'text-purple-500';
      case 'resolution':
        return 'text-green-500';
      case 'assignment':
        return 'text-orange-500';
      default:
        return 'text-adapt-text-muted';
    }
  };

  return (
    <div className="bg-adapt-bg-secondary rounded-lg border border-adapt-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <ActivityIcon size={20} className="text-adapt-primary" />
        <h3 className="text-lg font-semibold text-adapt-text-primary">Recent Activity</h3>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-adapt-text-muted">
            <ActivityIcon size={48} className="mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map(activity => {
            const Icon = getIcon(activity.type);
            const colorClass = getColor(activity.type);

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-adapt-bg-tertiary transition-colors"
              >
                <div className={`mt-0.5 ${colorClass}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-adapt-text-primary">
                    <span className="font-semibold">{activity.userName}</span>{' '}
                    {activity.description}
                  </div>
                  <div className="text-xs text-adapt-text-muted">
                    {formatRelativeTime(activity.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
