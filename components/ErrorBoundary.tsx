'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string | null;
}

/**
 * Error Boundary Component
 * 
 * Catches React rendering errors and displays a user-friendly fallback UI.
 * Logs errors with context for debugging.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Generate unique error ID for tracking
        const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Log error with context
        logger.error('React Error Boundary caught error', {
            errorId,
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        });

        this.setState({
            errorInfo,
            errorId,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                    <Card className="max-w-lg w-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Something went wrong</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        We encountered an unexpected error
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-sm font-mono text-red-400 break-all">
                                        {this.state.error.message}
                                    </p>
                                    {this.state.errorId && (
                                        <p className="text-xs text-red-400/60 mt-2">
                                            Error ID: {this.state.errorId}
                                        </p>
                                    )}
                                </div>
                            )}

                            {process.env.NODE_ENV === 'production' && this.state.errorId && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        If this problem persists, please contact support with this error ID:
                                    </p>
                                    <p className="text-sm font-mono mt-2">
                                        {this.state.errorId}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    onClick={this.handleReset}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    onClick={this.handleReload}
                                    className="flex-1 bg-[rgb(var(--color-bee-gold))] hover:bg-[rgb(var(--color-bee-amber))]"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reload Page
                                </Button>
                            </div>

                            <p className="text-xs text-center text-muted-foreground">
                                The error has been logged and our team has been notified.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Hook-based error boundary wrapper
 * For use in functional components
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
