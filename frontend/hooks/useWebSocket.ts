/**
 * React Hook for WebSocket connections
 * Provides easy WebSocket integration in React components
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketClient } from '../lib/websocket';

type WebSocketMessage = {
    type: string;
    [key: string]: any;
};

type UseWebSocketOptions = {
    url: string;
    token?: string | null;
    autoConnect?: boolean;
    onMessage?: (message: WebSocketMessage) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
};

export function useWebSocket(options: UseWebSocketOptions) {
    const {
        url,
        token = null,
        autoConnect = true,
        onMessage,
        onConnect,
        onDisconnect,
        onError,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const wsRef = useRef<WebSocketClient | null>(null);

    // Initialize WebSocket client
    useEffect(() => {
        wsRef.current = new WebSocketClient(url, token);

        // Subscribe to all messages
        const unsubscribe = wsRef.current.on('*', (message) => {
            setLastMessage(message);
            onMessage?.(message);
        });

        // Subscribe to connection status
        const connectionUnsubscribe = wsRef.current.on('connection', (message) => {
            if (message.status === 'connected') {
                setIsConnected(true);
                onConnect?.();
            }
        });

        // Auto-connect if enabled
        if (autoConnect) {
            wsRef.current.connect().catch((error) => {
                console.error('WebSocket connection error:', error);
                onError?.(error);
            });
        }

        // Cleanup on unmount
        return () => {
            unsubscribe();
            connectionUnsubscribe();
            wsRef.current?.disconnect();
            setIsConnected(false);
            onDisconnect?.();
        };
    }, [url, token, autoConnect]);

    // Send message function
    const sendMessage = useCallback((message: WebSocketMessage) => {
        wsRef.current?.send(message);
    }, []);

    // Manual connect function
    const connect = useCallback(async () => {
        try {
            await wsRef.current?.connect();
            setIsConnected(true);
            onConnect?.();
        } catch (error) {
            console.error('WebSocket connection error:', error);
            onError?.(error as Event);
        }
    }, [onConnect, onError]);

    // Manual disconnect function
    const disconnect = useCallback(() => {
        wsRef.current?.disconnect();
        setIsConnected(false);
        onDisconnect?.();
    }, [onDisconnect]);

    // Subscribe to specific message type
    const subscribe = useCallback((messageType: string, handler: (message: WebSocketMessage) => void) => {
        return wsRef.current?.on(messageType, handler) || (() => { });
    }, []);

    return {
        isConnected,
        lastMessage,
        sendMessage,
        connect,
        disconnect,
        subscribe,
    };
}

/**
 * Hook for inventory WebSocket
 */
export function useInventoryWebSocket(token?: string | null) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    return useWebSocket({
        url: `${wsUrl}/ws/inventory`,
        token,
    });
}

/**
 * Hook for orders WebSocket
 */
export function useOrdersWebSocket(token?: string | null) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    return useWebSocket({
        url: `${wsUrl}/ws/orders`,
        token,
    });
}

/**
 * Hook for dashboard WebSocket
 */
export function useDashboardWebSocket(token?: string | null) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    return useWebSocket({
        url: `${wsUrl}/ws/dashboard`,
        token,
    });
}

/**
 * Hook for collaboration WebSocket
 */
export function useCollaborationWebSocket(documentId: string, token?: string | null) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    return useWebSocket({
        url: `${wsUrl}/ws/collaboration/${documentId}`,
        token,
    });
}
