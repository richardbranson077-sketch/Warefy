/**
 * Loading Spinner Component
 * Displays a loading animation
 */

export function LoadingSpinner({ size = 'md', message }: { size?: 'sm' | 'md' | 'lg'; message?: string }) {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
            {message && <p className="mt-4 text-gray-600">{message}</p>}
        </div>
    );
}

/**
 * Skeleton Card Component
 * Displays a loading skeleton
 */
export function SkeletonCard() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
    );
}

/**
 * Skeleton Table Component
 */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="animate-pulse space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
        </div>
    );
}

// Default export for backward compatibility
export default LoadingSpinner;
