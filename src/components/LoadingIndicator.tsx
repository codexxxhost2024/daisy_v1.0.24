
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Generating documentation with AI...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-medical-primary mb-4" />
      <p className="text-sm text-gray-600">{message}</p>
      <div className="mt-4 text-xs text-gray-500 max-w-xs text-center">
        Daisy is analyzing your input and generating comprehensive clinical documentation
      </div>
    </div>
  );
};

export default LoadingIndicator;
