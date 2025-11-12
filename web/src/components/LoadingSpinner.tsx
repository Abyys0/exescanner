import React from 'react';

export const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 40 }) => {
  return (
    <div className="flex items-center justify-center">
      <div
        className="animate-spin rounded-full border-4 border-dark-border border-t-neon-blue"
        style={{ width: size, height: size }}
      />
    </div>
  );
};
