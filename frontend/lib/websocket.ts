/**
 * WebSocket Client
 * Handles WebSocket connections with auto-reconnection
 */

type WebSocketMessage = {
    type: string;
    [key: string]: any;
};

type MessageHandler = (message: WebSocketMessage) => void;

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private url: string;
    private token: string | null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000; // Start with 1 second
    private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
    private isIntentionallyClosed = false;
    private pingInterval: NodeJS.Timeout | null = null;

    constructor(url: string, token: string | null = null) {
        this.url = url;
        this.token = token;
    }

    /**
     * Connect to WebSocket server
     */
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const wsUrl = this.token ? `${this.url}?token=${this.token}` : this.url;
                this.ws = new WebSocket(wsUrl);

                this.ws.onopen = () => {
                    console.log(`WebSocket connected: ${this.url}`);
                    this.reconnectAttempts = 0;
                    this.reconnectDelay = 1000;
                    this.isIntentionallyClosed = false;
                    this.startPing();
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message: WebSocketMessage = JSON.parse(event.data);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket closed');
                    this.stopPing();

                    if (!this.isIntentionallyClosed) {
                        this.attemptReconnect();
                    }
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        this.isIntentionallyClosed = true;
        this.stopPing();

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    /**
     * Send message to server
     */
    send(message: WebSocketMessage): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket is not connected');
        }
    }

    /**
     * Subscribe to specific message type
     */
    on(messageType: string, handler: MessageHandler): () => void {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, new Set());
        }

        this.messageHandlers.get(messageType)!.add(handler);

        // Return unsubscribe function
        return () => {
            const handlers = this.messageHandlers.get(messageType);
            if (handlers) {
                handlers.delete(handler);
            }
        };
    }

    /**
     * Handle incoming message
     */
    private handleMessage(message: WebSocketMessage): void {
        const handlers = this.messageHandlers.get(message.type);

        if (handlers) {
            handlers.forEach((handler) => {
                try {
                    handler(message);
                } catch (error) {
                    console.error(`Error in message handler for ${message.type}:`, error);
                }
            });
        }

        // Also trigger wildcard handlers
        const wildcardHandlers = this.messageHandlers.get('*');
        if (wildcardHandlers) {
            wildcardHandlers.forEach((handler) => {
                try {
                    handler(message);
                } catch (error) {
                    console.error('Error in wildcard message handler:', error);
                }
            });
        }
    }

    /**
     * Attempt to reconnect
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            this.connect().catch((error) => {
                console.error('Reconnection failed:', error);
            });
        }, delay);
    }

    /**
     * Start ping interval to keep connection alive
     */
    private startPing(): void {
        this.pingInterval = setInterval(() => {
            this.send({
                type: 'ping',
                timestamp: new Date().toISOString(),
            });
        }, 30000); // Ping every 30 seconds
    }

    /**
     * Stop ping interval
     */
    private stopPing(): void {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    /**
     * Check if WebSocket is connected
     */
    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}

// Helper functions for specific WebSocket endpoints

/**
 * Create inventory WebSocket client
 */
export function createInventoryWebSocket(token: string | null = null): WebSocketClient {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    return new WebSocketClient(`${wsUrl}/ws/inventory`, token);
}

/**
 * Create orders WebSocket client
 */
export function createOrdersWebSocket(token: string | null = null): WebSocketClient {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    return new WebSocketClient(`${wsUrl}/ws/orders`, token);
}

/**
 * Create dashboard WebSocket client
 */
export function createDashboardWebSocket(token: string | null = null): WebSocketClient {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    return new WebSocketClient(`${wsUrl}/ws/dashboard`, token);
}

/**
 * Create collaboration WebSocket client
 */
export function createCollaborationWebSocket(
    documentId: string,
    token: string | null = null
): WebSocketClient {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    return new WebSocketClient(`${wsUrl}/ws/collaboration/${documentId}`, token);
}
