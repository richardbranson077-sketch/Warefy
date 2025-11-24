/**
 * Error Alert Component
 * Displays error messages with retry functionality
 */

import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
    message: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorAlert({ message, onRetry, className = '' }: ErrorAlertProps) {
    return (
        <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
            <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-700 text-sm mt-1">{message}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-3 flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Empty State Component
 * Displays when no data is available
 */
interface EmptyStateProps {
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            {icon && <div className="mb-4 text-gray-400">{icon}</div>}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            {description && <p className="text-gray-600 mb-6 max-w-md">{description}</p>}
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
