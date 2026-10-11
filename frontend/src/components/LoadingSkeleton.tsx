import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'chart' | 'text' | 'table';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'card',
  count = 1,
}) => {
  const renderItem = (index: number) => {
    switch (variant) {
      case 'card':
        return (
          <div
            key={index}
            className={`bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 animate-pulse ${className}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-slate-700 rounded w-1/3"></div>
              <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
            </div>
            <div className="h-8 bg-slate-700 rounded w-2/3 mb-3"></div>
            <div className="h-4 bg-slate-700/60 rounded w-1/2"></div>
          </div>
        );

      case 'chart':
        return (
          <div
            key={index}
            className={`bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 animate-pulse flex flex-col justify-between ${className}`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="h-5 bg-slate-700 rounded w-1/4"></div>
              <div className="h-4 bg-slate-700 rounded w-1/6"></div>
            </div>
            <div className="space-y-3 flex-1 flex items-end gap-3 pb-4">
              <div className="bg-slate-700 rounded-t h-40 flex-1"></div>
              <div className="bg-slate-700/70 rounded-t h-56 flex-1"></div>
              <div className="bg-slate-700 rounded-t h-32 flex-1"></div>
              <div className="bg-slate-700/80 rounded-t h-64 flex-1"></div>
              <div className="bg-slate-700 rounded-t h-48 flex-1"></div>
              <div className="bg-slate-700/70 rounded-t h-60 flex-1"></div>
            </div>
            <div className="h-4 bg-slate-700/50 rounded w-full"></div>
          </div>
        );

      case 'table':
        return (
          <div
            key={index}
            className={`bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 animate-pulse ${className}`}
          >
            <div className="h-6 bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((row) => (
                <div key={row} className="grid grid-cols-5 gap-4">
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-700/70 rounded"></div>
                  <div className="h-4 bg-slate-700/60 rounded"></div>
                  <div className="h-4 bg-slate-700/80 rounded"></div>
                  <div className="h-4 bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'text':
      default:
        return (
          <div
            key={index}
            className={`space-y-2 animate-pulse ${className}`}
          >
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700/70 rounded w-full"></div>
            <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => renderItem(i))}
    </>
  );
};
