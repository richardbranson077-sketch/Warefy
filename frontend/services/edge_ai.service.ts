import { apiClient } from '@/lib/api';

export interface EdgeDevice {
    id: string;
    name: string;
    device_type: string;
    location: string;
    status: string;
    cpu_usage: number;
    memory_usage: number;
    storage_usage: number;
    last_seen: string;
    deployed_models: string[];
    total_inferences?: number;
}

export interface DeployedModel {
    id: string;
    name: string;
    type: string;
    version: string;
    device_ids: string[];
    optimization_level: string;
    status: string;
    deployed_at: string;
    total_inferences?: number;
    avg_latency_ms?: number;
    accuracy?: number;
}

export interface InferenceResult {
    id?: string;
    device_id: string;
    model_name: string;
    results: any;
    latency_ms: number;
    timestamp: string;
}

export interface PerformanceMetrics {
    summary: {
        total_devices: number;
        online_devices: number;
        total_models: number;
        total_inferences: number;
        avg_latency_ms: number;
    };
    latency_trend: Array<{ time: string; avg_latency: number; p95_latency: number }>;
    throughput_trend: Array<{ time: string; inferences: number }>;
    device_resources: Array<{ device_name: string; cpu: number; memory: number; storage: number }>;
    model_performance: Array<{ model_name: string; avg_latency: number; accuracy: number; total_inferences: number }>;
}

export const edgeAIService = {
    /**
     * Register a new edge device
     */
    registerDevice: async (data: {
        name: string;
        device_type: string;
        location: string;
        hardware_specs: any;
    }) => {
        const response = await apiClient.post('/api/v1/edge-ai/devices/register', data);
        return response.data;
    },

    /**
     * Get all edge devices
     */
    getDevices: async () => {
        const response = await apiClient.get<EdgeDevice[]>('/api/v1/edge-ai/devices');
        return response.data;
    },

    /**
     * Get specific device
     */
    getDevice: async (deviceId: string) => {
        const response = await apiClient.get<EdgeDevice>(`/api/v1/edge-ai/devices/${deviceId}`);
        return response.data;
    },

    /**
     * Unregister device
     */
    unregisterDevice: async (deviceId: string) => {
        await apiClient.delete(`/api/v1/edge-ai/devices/${deviceId}`);
    },

    /**
     * Deploy model to devices
     */
    deployModel: async (data: {
        model_name: string;
        model_type: string;
        device_ids: string[];
        optimization_level: string;
    }) => {
        const response = await apiClient.post('/api/v1/edge-ai/models/deploy', data);
        return response.data;
    },

    /**
     * Get all deployed models
     */
    getModels: async () => {
        const response = await apiClient.get<DeployedModel[]>('/api/v1/edge-ai/models');
        return response.data;
    },

    /**
     * Undeploy model
     */
    undeployModel: async (modelId: string) => {
        await apiClient.delete(`/api/v1/edge-ai/models/${modelId}`);
    },

    /**
     * Run inference on device
     */
    runInference: async (data: {
        device_id: string;
        model_name: string;
        input_data?: string;
    }) => {
        const response = await apiClient.post<InferenceResult>('/api/v1/edge-ai/inference', data);
        return response.data;
    },

    /**
     * Get inference history
     */
    getInferenceHistory: async (limit: number = 50) => {
        const response = await apiClient.get<InferenceResult[]>(`/api/v1/edge-ai/inference/history?limit=${limit}`);
        return response.data;
    },

    /**
     * Get performance metrics
     */
    getPerformance: async () => {
        const response = await apiClient.get<PerformanceMetrics>('/api/v1/edge-ai/performance');
        return response.data;
    },

    /**
     * Optimize model
     */
    optimizeModel: async (modelId: string, optimizationType: string) => {
        const response = await apiClient.post(`/api/v1/edge-ai/optimize?model_id=${modelId}&optimization_type=${optimizationType}`);
        return response.data;
    }
};
