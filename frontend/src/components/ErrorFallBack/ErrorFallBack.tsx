import React from 'react';

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  console.log('error bound rendered')
  return (
    <div role="alert">
      <h3>Something went wrong</h3>
      <pre style={{ color: 'red' }}>{error?.message || "An unexpected error occurred."}</pre>
      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
}
