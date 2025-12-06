'use client';

import { useState, useEffect } from 'react';
import {
    Cpu,
    Zap,
    Activity,
    RefreshCw,
    Plus,
    Trash2,
    Play,
    TrendingUp,
    Server,
    Gauge,
    BarChart3,
    Download,
    Settings,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    BarChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import { edgeAIService, EdgeDevice, DeployedModel, PerformanceMetrics } from '@/services/edge_ai.service';

export default function EdgeAIPage() {
    const [devices, setDevices] = useState<EdgeDevice[]>([]);
    const [models, setModels] = useState<DeployedModel[]>([]);
    const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'devices' | 'models' | 'inference' | 'analytics'>('devices');

    // Device registration form
    const [showDeviceForm, setShowDeviceForm] = useState(false);
    const [deviceForm, setDeviceForm] = useState({
        name: '',
        device_type: 'camera',
        location: '',
        hardware_specs: { cpu: 'ARM Cortex-A72', memory: '4GB', storage: '32GB' }
    });

    // Model deployment form
    const [showModelForm, setShowModelForm] = useState(false);
    const [modelForm, setModelForm] = useState({
        model_name: '',
        model_type: 'object_detection',
        device_ids: [] as string[],
        optimization_level: 'balanced'
    });

    // Inference test
    const [inferenceDevice, setInferenceDevice] = useState('');
    const [inferenceModel, setInferenceModel] = useState('');
    const [inferenceResult, setInferenceResult] = useState<any>(null);
    const [inferenceLoading, setInferenceLoading] = useState(false);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [devicesData, modelsData, perfData] = await Promise.all([
                edgeAIService.getDevices(),
                edgeAIService.getModels(),
                edgeAIService.getPerformance()
            ]);
            setDevices(devicesData);
            setModels(modelsData);
            setPerformance(perfData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterDevice = async () => {
        try {
            await edgeAIService.registerDevice(deviceForm);
            setShowDeviceForm(false);
            setDeviceForm({
                name: '',
                device_type: 'camera',
                location: '',
                hardware_specs: { cpu: 'ARM Cortex-A72', memory: '4GB', storage: '32GB' }
            });
            fetchData();
        } catch (error) {
            console.error('Failed to register device:', error);
        }
    };

    const handleDeployModel = async () => {
        try {
            await edgeAIService.deployModel(modelForm);
            setShowModelForm(false);
            setModelForm({
                model_name: '',
                model_type: 'object_detection',
                device_ids: [],
                optimization_level: 'balanced'
            });
            fetchData();
        } catch (error) {
            console.error('Failed to deploy model:', error);
        }
    };

    const handleRunInference = async () => {
        if (!inferenceDevice || !inferenceModel) return;

        setInferenceLoading(true);
        try {
            const result = await edgeAIService.runInference({
                device_id: inferenceDevice,
                model_name: inferenceModel
            });
            setInferenceResult(result);
        } catch (error) {
            console.error('Failed to run inference:', error);
        } finally {
            setInferenceLoading(false);
        }
    };

    const handleUnregisterDevice = async (deviceId: string) => {
        try {
            await edgeAIService.unregisterDevice(deviceId);
            fetchData();
        } catch (error) {
            console.error('Failed to unregister device:', error);
        }
    };

    const handleUndeployModel = async (modelId: string) => {
        try {
            await edgeAIService.undeployModel(modelId);
            fetchData();
        } catch (error) {
            console.error('Failed to undeploy model:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Cpu className="h-8 w-8 text-purple-600" />
                        Edge AI Platform
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Distributed AI processing and model deployment
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-all flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            {performance && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase">Total Devices</p>
                            <Server className="h-5 w-5 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{performance.summary.total_devices}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase">Online</p>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{performance.summary.online_devices}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase">Models</p>
                            <Zap className="h-5 w-5 text-yellow-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{performance.summary.total_models}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase">Inferences</p>
                            <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{performance.summary.total_inferences.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase">Avg Latency</p>
                            <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{performance.summary.avg_latency_ms.toFixed(0)}ms</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                        {[
                            { id: 'devices', label: 'Devices', icon: Server },
                            { id: 'models', label: 'Models', icon: Zap },
                            { id: 'inference', label: 'Inference', icon: Play },
                            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-purple-600 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="h-5 w-5" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Devices Tab */}
                    {activeTab === 'devices' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Edge Devices</h2>
                                <button
                                    onClick={() => setShowDeviceForm(!showDeviceForm)}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Register Device
                                </button>
                            </div>

                            {showDeviceForm && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-4">Register New Device</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Device Name"
                                            value={deviceForm.name}
                                            onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                        <select
                                            value={deviceForm.device_type}
                                            onChange={(e) => setDeviceForm({ ...deviceForm, device_type: e.target.value })}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        >
                                            <option value="camera">Camera</option>
                                            <option value="sensor">Sensor</option>
                                            <option value="iot">IoT Device</option>
                                            <option value="gateway">Gateway</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Location"
                                            value={deviceForm.location}
                                            onChange={(e) => setDeviceForm({ ...deviceForm, location: e.target.value })}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                        <button
                                            onClick={handleRegisterDevice}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                        >
                                            Register
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {devices.map((device) => (
                                    <div key={device.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Server className="h-5 w-5 text-purple-600" />
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{device.name}</h3>
                                                    <p className="text-xs text-gray-500">{device.device_type} • {device.location}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${device.status === 'online'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {device.status}
                                                </span>
                                                <button
                                                    onClick={() => handleUnregisterDevice(device.id)}
                                                    className="p-1 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">CPU:</span>
                                                <span className="font-medium">{device.cpu_usage.toFixed(1)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Memory:</span>
                                                <span className="font-medium">{device.memory_usage.toFixed(1)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Storage:</span>
                                                <span className="font-medium">{device.storage_usage.toFixed(1)}%</span>
                                            </div>
                                            {device.deployed_models.length > 0 && (
                                                <div className="pt-2 border-t border-gray-200">
                                                    <p className="text-xs text-gray-500 mb-1">Deployed Models:</p>
                                                    {device.deployed_models.map((model, i) => (
                                                        <span key={i} className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded mr-1 mb-1">
                                                            {model}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Models Tab */}
                    {activeTab === 'models' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Deployed Models</h2>
                                <button
                                    onClick={() => setShowModelForm(!showModelForm)}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Deploy Model
                                </button>
                            </div>

                            {showModelForm && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-4">Deploy New Model</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Model Name"
                                            value={modelForm.model_name}
                                            onChange={(e) => setModelForm({ ...modelForm, model_name: e.target.value })}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                        <select
                                            value={modelForm.model_type}
                                            onChange={(e) => setModelForm({ ...modelForm, model_type: e.target.value })}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        >
                                            <option value="object_detection">Object Detection</option>
                                            <option value="classification">Classification</option>
                                            <option value="segmentation">Segmentation</option>
                                        </select>
                                        <select
                                            value={modelForm.optimization_level}
                                            onChange={(e) => setModelForm({ ...modelForm, optimization_level: e.target.value })}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        >
                                            <option value="speed">Speed</option>
                                            <option value="balanced">Balanced</option>
                                            <option value="accuracy">Accuracy</option>
                                        </select>
                                        <button
                                            onClick={handleDeployModel}
                                            disabled={!modelForm.model_name || modelForm.device_ids.length === 0}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Deploy
                                        </button>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Select Devices:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {devices.map((device) => (
                                                <label key={device.id} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        checked={modelForm.device_ids.includes(device.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setModelForm({ ...modelForm, device_ids: [...modelForm.device_ids, device.id] });
                                                            } else {
                                                                setModelForm({ ...modelForm, device_ids: modelForm.device_ids.filter(id => id !== device.id) });
                                                            }
                                                        }}
                                                        className="rounded text-purple-600 focus:ring-purple-500"
                                                    />
                                                    <span className="text-sm">{device.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {models.map((model) => (
                                    <div key={model.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Zap className="h-5 w-5 text-yellow-600" />
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{model.name}</h3>
                                                    <p className="text-xs text-gray-500">{model.type} • v{model.version}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleUndeployModel(model.id)}
                                                className="p-1 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                                            <div>
                                                <p className="text-gray-600 text-xs">Devices</p>
                                                <p className="font-bold text-gray-900">{model.device_ids.length}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 text-xs">Latency</p>
                                                <p className="font-bold text-gray-900">{model.avg_latency_ms?.toFixed(0)}ms</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 text-xs">Accuracy</p>
                                                <p className="font-bold text-gray-900">{model.accuracy?.toFixed(1)}%</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                                {model.optimization_level}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {model.total_inferences?.toLocaleString()} inferences
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Inference Tab */}
                    {activeTab === 'inference' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Test Inference</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Device</label>
                                    <select
                                        value={inferenceDevice}
                                        onChange={(e) => setInferenceDevice(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="">Choose a device...</option>
                                        {devices.filter(d => d.status === 'online').map((device) => (
                                            <option key={device.id} value={device.id}>{device.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Model</label>
                                    <select
                                        value={inferenceModel}
                                        onChange={(e) => setInferenceModel(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="">Choose a model...</option>
                                        {models.map((model) => (
                                            <option key={model.id} value={model.name}>{model.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleRunInference}
                                disabled={!inferenceDevice || !inferenceModel || inferenceLoading}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {inferenceLoading ? (
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Play className="h-5 w-5" />
                                )}
                                {inferenceLoading ? 'Running...' : 'Run Inference'}
                            </button>

                            {inferenceResult && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        Inference Results
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Latency</p>
                                            <p className="text-2xl font-bold text-gray-900">{inferenceResult.latency_ms.toFixed(2)}ms</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Timestamp</p>
                                            <p className="text-sm font-medium text-gray-900">{new Date(inferenceResult.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Results:</p>
                                        <pre className="text-xs text-gray-900 overflow-x-auto">{JSON.stringify(inferenceResult.results, null, 2)}</pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && performance && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Performance Analytics</h2>

                            {/* Latency Trend */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Latency Trend (24h)</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={performance.latency_trend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="avg_latency" stroke="#8b5cf6" strokeWidth={2} name="Avg Latency (ms)" />
                                        <Line type="monotone" dataKey="p95_latency" stroke="#ec4899" strokeWidth={2} name="P95 Latency (ms)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Throughput */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inference Throughput (24h)</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={performance.throughput_trend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="inferences" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Device Resources */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Resource Utilization</h3>
                                <div className="space-y-3">
                                    {performance.device_resources.map((device, i) => (
                                        <div key={i} className="bg-gray-50 rounded-lg p-4">
                                            <p className="font-medium text-gray-900 mb-3">{device.device_name}</p>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600 mb-1">CPU</p>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${device.cpu}%` }}></div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{device.cpu.toFixed(1)}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 mb-1">Memory</p>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${device.memory}%` }}></div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{device.memory.toFixed(1)}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 mb-1">Storage</p>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${device.storage}%` }}></div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{device.storage.toFixed(1)}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
