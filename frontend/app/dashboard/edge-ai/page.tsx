'use client';

import { useState } from 'react';
import {
    Cpu,
    Zap,
    Activity,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RefreshCw,
    Settings,
    Download,
    Upload,
    Play,
    Pause,
    BarChart3,
    Brain,
    Wifi,
    WifiOff,
    Server,
    HardDrive,
    Gauge,
    Clock,
    Target,
    Shield,
    Eye,
    Package,
    Camera,
    Thermometer
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EdgeDevice {
    id: string;
    name: string;
    location: string;
    status: 'online' | 'offline' | 'warning';
    cpu: number;
    memory: number;
    temperature: number;
    uptime: string;
    models: number;
    lastSync: string;
}

interface AIModel {
    id: string;
    name: string;
    type: string;
    status: 'active' | 'idle' | 'training';
    accuracy: number;
    latency: number;
    version: string;
}

export default function EdgeAIPage() {
    const [selectedDevice, setSelectedDevice] = useState<string>('device-1');
    const [deployingModel, setDeployingModel] = useState(false);

    const edgeDevices: EdgeDevice[] = [
        {
            id: 'device-1',
            name: 'Warehouse Scanner A1',
            location: 'Warehouse North',
            status: 'online',
            cpu: 45,
            memory: 62,
            temperature: 58,
            uptime: '15d 4h',
            models: 3,
            lastSync: '2 min ago'
        },
        {
            id: 'device-2',
            name: 'Quality Control Cam B2',
            location: 'Production Line 2',
            status: 'online',
            cpu: 78,
            memory: 85,
            temperature: 72,
            uptime: '8d 12h',
            models: 2,
            lastSync: '5 min ago'
        },
        {
            id: 'device-3',
            name: 'Loading Dock Sensor C3',
            location: 'Loading Bay 3',
            status: 'warning',
            cpu: 92,
            memory: 95,
            temperature: 85,
            uptime: '3d 6h',
            models: 4,
            lastSync: '15 min ago'
        },
        {
            id: 'device-4',
            name: 'Inventory Counter D4',
            location: 'Warehouse South',
            status: 'offline',
            cpu: 0,
            memory: 0,
            temperature: 0,
            uptime: '0h',
            models: 0,
            lastSync: '2h ago'
        }
    ];

    const aiModels: AIModel[] = [
        {
            id: 'model-1',
            name: 'Package Detection',
            type: 'Computer Vision',
            status: 'active',
            accuracy: 98.5,
            latency: 12,
            version: 'v2.3.1'
        },
        {
            id: 'model-2',
            name: 'Barcode Scanner',
            type: 'OCR',
            status: 'active',
            accuracy: 99.2,
            latency: 8,
            version: 'v1.8.0'
        },
        {
            id: 'model-3',
            name: 'Quality Inspector',
            type: 'Defect Detection',
            status: 'active',
            accuracy: 96.8,
            latency: 15,
            version: 'v3.1.2'
        },
        {
            id: 'model-4',
            name: 'Inventory Counter',
            type: 'Object Counting',
            status: 'idle',
            accuracy: 97.3,
            latency: 10,
            version: 'v2.0.5'
        }
    ];

    const performanceData = Array.from({ length: 20 }, (_, i) => ({
        time: `${i}m`,
        cpu: 40 + Math.random() * 30,
        memory: 50 + Math.random() * 30,
        inference: 10 + Math.random() * 10
    }));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-600 bg-green-100';
            case 'offline': return 'text-gray-600 bg-gray-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'online': return <Wifi className="h-4 w-4" />;
            case 'offline': return <WifiOff className="h-4 w-4" />;
            case 'warning': return <AlertTriangle className="h-4 w-4" />;
            default: return <WifiOff className="h-4 w-4" />;
        }
    };

    const selectedDeviceData = edgeDevices.find(d => d.id === selectedDevice);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                            <Cpu className="h-7 w-7 text-white" />
                        </div>
                        Edge AI Management
                    </h1>
                    <p className="text-gray-600 mt-2">Deploy and monitor AI models on edge devices</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Export Logs
                    </button>
                    <button
                        onClick={() => setDeployingModel(true)}
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm transition flex items-center gap-2"
                    >
                        <Upload className="h-5 w-5" />
                        Deploy Model
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Active Devices</p>
                        <Server className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {edgeDevices.filter(d => d.status === 'online').length}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">of {edgeDevices.length} total</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Running Models</p>
                        <Brain className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {aiModels.filter(m => m.status === 'active').length}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">across all devices</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Avg Accuracy</p>
                        <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {(aiModels.reduce((sum, m) => sum + m.accuracy, 0) / aiModels.length).toFixed(1)}%
                    </p>
                    <p className="text-xs text-green-600 mt-1">+2.3% this week</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Avg Latency</p>
                        <Zap className="h-4 w-4 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {(aiModels.reduce((sum, m) => sum + m.latency, 0) / aiModels.length).toFixed(0)}ms
                    </p>
                    <p className="text-xs text-gray-600 mt-1">inference time</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Edge Devices List */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Server className="h-5 w-5 text-purple-600" />
                        Edge Devices
                    </h3>
                    <div className="space-y-3">
                        {edgeDevices.map(device => (
                            <div
                                key={device.id}
                                onClick={() => setSelectedDevice(device.id)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition ${selectedDevice === device.id
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{device.name}</h4>
                                        <p className="text-sm text-gray-600">{device.location}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(device.status)}`}>
                                        {getStatusIcon(device.status)}
                                        {device.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                                    <div>
                                        <p className="text-gray-500">CPU</p>
                                        <p className="font-bold text-gray-900">{device.cpu}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Memory</p>
                                        <p className="font-bold text-gray-900">{device.memory}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Models</p>
                                        <p className="font-bold text-gray-900">{device.models}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Device Details & Performance */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Device Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Device Details</h3>
                        {selectedDeviceData && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Cpu className="h-4 w-4 text-blue-600" />
                                        <p className="text-xs text-gray-600 font-semibold">CPU Usage</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{selectedDeviceData.cpu}%</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${selectedDeviceData.cpu}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <HardDrive className="h-4 w-4 text-purple-600" />
                                        <p className="text-xs text-gray-600 font-semibold">Memory</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{selectedDeviceData.memory}%</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all"
                                            style={{ width: `${selectedDeviceData.memory}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Thermometer className="h-4 w-4 text-orange-600" />
                                        <p className="text-xs text-gray-600 font-semibold">Temperature</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{selectedDeviceData.temperature}°C</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {selectedDeviceData.temperature > 80 ? 'High' : 'Normal'}
                                    </p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="h-4 w-4 text-green-600" />
                                        <p className="text-xs text-gray-600 font-semibold">Uptime</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{selectedDeviceData.uptime}</p>
                                    <p className="text-xs text-gray-600 mt-1">Last sync: {selectedDeviceData.lastSync}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Performance Chart */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-600" />
                            Real-Time Performance
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" name="CPU %" />
                                <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMemory)" name="Memory %" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* AI Models */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Brain className="h-5 w-5 text-purple-600" />
                            Deployed AI Models
                        </h3>
                        <div className="space-y-3">
                            {aiModels.map(model => (
                                <div key={model.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{model.name}</h4>
                                            <p className="text-sm text-gray-600">{model.type} • {model.version}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${model.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : model.status === 'training'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {model.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Accuracy</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${model.accuracy}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{model.accuracy}%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Latency</p>
                                            <p className="text-sm font-bold text-gray-900">{model.latency}ms</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
