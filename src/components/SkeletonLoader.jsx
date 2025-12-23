// src/components/SkeletonLoader.jsx
import React from 'react';

const SkeletonLoader = ({ rows = 10, cols = 10 }) => {
  return (
    <div className="p-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="border border-gray-200 rounded">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="border-b border-gray-200 last:border-b-0">
              <div className="flex">
                {[...Array(cols)].map((_, j) => (
                  <div key={j} className="p-2 flex-1">
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;