import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-primary animate-spin" />
    </div>
  );
};

export default LoadingSpinner; 