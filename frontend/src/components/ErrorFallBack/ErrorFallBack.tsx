import type { FallbackProps } from 'react-error-boundary';


export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  console.log('error bound rendered')
  return (
    <div role="alert">
      <h3>Something went wrong</h3>
      <pre style={{ color: 'red' }}>{(error as Error)?.message || "An unexpected error occurred."}</pre>
      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
}
