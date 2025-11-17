import React, { useEffect } from 'react';
import { useCollaboration } from '@contexts/CollaborationContext';
import { Users } from 'lucide-react';

interface PresenceIndicatorProps {
  currentUserId: string;
  currentUserName: string;
  location: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  currentUserId,
  currentUserName,
  location,
}) => {
  const { getActiveUsers, updatePresence } = useCollaboration();
  const activeUsers = getActiveUsers().filter(u => u.userId !== currentUserId);

  // Update presence on mount and location change
  useEffect(() => {
    updatePresence(currentUserId, {
      userName: currentUserName,
      location,
      status: 'active',
    });

    // Update every 30 seconds to keep presence alive
    const interval = setInterval(() => {
      updatePresence(currentUserId, { location, status: 'active' });
    }, 30000);

    return () => {
      clearInterval(interval);
      updatePresence(currentUserId, { status: 'offline' });
    };
  }, [currentUserId, currentUserName, location, updatePresence]);

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-adapt-bg-tertiary border border-adapt-border rounded-lg">
      <Users size={16} className="text-adapt-primary" />
      <div className="flex -space-x-2">
        {activeUsers.slice(0, 5).map((user, index) => (
          <div
            key={user.userId}
            className="w-8 h-8 rounded-full bg-adapt-primary border-2 border-adapt-bg-tertiary flex items-center justify-center text-white text-xs font-semibold"
            title={`${user.userName} - ${user.location}`}
            style={{ zIndex: activeUsers.length - index }}
          >
            {user.userName.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
      {activeUsers.length > 5 && (
        <span className="text-xs text-adapt-text-muted">
          +{activeUsers.length - 5} more
        </span>
      )}
    </div>
  );
};
