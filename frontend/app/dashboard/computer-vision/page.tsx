'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Camera,
    Scan,
    Package,
    CheckCircle,
    XCircle,
    Upload,
    Download,
    RefreshCw,
    Zap,
    Eye,
    FileText,
    BarChart3,
    Settings,
    Play,
    Pause,
    Image as ImageIcon,
    AlertCircle,
    Maximize2
} from 'lucide-react';

interface ScanResult {
    id: string;
    type: 'barcode' | 'qr' | 'text';
    data: string;
    timestamp: Date;
    confidence: number;
    packageInfo?: {
        sku: string;
        name: string;
        status: string;
    };
}

export default function ComputerVisionPage() {
    const [scanning, setScanning] = useState(false);
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);
    const [selectedMode, setSelectedMode] = useState<'barcode' | 'qr' | 'ocr' | 'package'>('barcode');
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            }
        } catch (error) {
            console.error('Camera access denied:', error);
            alert('Please allow camera access to use scanning features');
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            setCameraActive(false);
        }
    };

    const simulateScan = () => {
        const mockResults: ScanResult[] = [
            {
                id: Date.now().toString(),
                type: selectedMode === 'qr' ? 'qr' : 'barcode',
                data: selectedMode === 'qr' ? 'QR-PKG-12345-ABCD' : '1234567890123',
                timestamp: new Date(),
                confidence: 98.5,
                packageInfo: {
                    sku: 'SKU-001',
                    name: 'Premium Widget',
                    status: 'In Stock'
                }
            }
        ];
        setScanResults([...mockResults, ...scanResults]);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            simulateScan();
        }
    };

    const stats = {
        totalScans: scanResults.length,
        successful: scanResults.filter(r => r.confidence > 90).length,
        avgConfidence: scanResults.length > 0
            ? Math.round(scanResults.reduce((sum, r) => sum + r.confidence, 0) / scanResults.length)
            : 0
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <Camera className="h-7 w-7 text-white" />
                        </div>
                        Computer Vision & Scanning
                    </h1>
                    <p className="text-gray-600 mt-2">AI-powered barcode, QR code, and package recognition</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        <Upload className="h-5 w-5" />
                        Upload Image
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Total Scans</p>
                        <Scan className="h-4 w-4 text-indigo-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalScans}</p>
                </div>
                <div className="bg-green-50 rounded-xl border border-green-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-green-700 uppercase font-semibold">Successful</p>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">{stats.successful}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Avg Confidence</p>
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.avgConfidence}%</p>
                </div>
            </div>

            {/* Mode Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-2 mb-6 shadow-sm">
                <div className="flex gap-2">
                    {[
                        { id: 'barcode', label: 'Barcode', icon: Scan },
                        { id: 'qr', label: 'QR Code', icon: Maximize2 },
                        { id: 'ocr', label: 'Text OCR', icon: FileText },
                        { id: 'package', label: 'Package Detection', icon: Package }
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setSelectedMode(mode.id as any)}
                            className={`flex-1 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${selectedMode === mode.id
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <mode.icon className="h-5 w-5" />
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Camera View */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Live Scanner</h3>
                        <button
                            onClick={cameraActive ? stopCamera : startCamera}
                            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${cameraActive
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                        >
                            {cameraActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            {cameraActive ? 'Stop' : 'Start'} Camera
                        </button>
                    </div>

                    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />

                        {!cameraActive && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Camera className="h-16 w-16 text-gray-600 mb-4" />
                                <p className="text-gray-400">Camera not active</p>
                            </div>
                        )}

                        {cameraActive && (
                            <div className="absolute inset-0 border-4 border-indigo-500/50 pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-indigo-500"></div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={simulateScan}
                        disabled={!cameraActive}
                        className="w-full mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Zap className="h-5 w-5" />
                        Scan Now
                    </button>
                </div>

                {/* Results */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Scan Results</h3>
                        <button
                            onClick={() => setScanResults([])}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {scanResults.length === 0 ? (
                            <div className="text-center py-12">
                                <Scan className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No scans yet</p>
                            </div>
                        ) : (
                            scanResults.map((result) => (
                                <div key={result.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-lg ${result.type === 'qr' ? 'bg-purple-100' : 'bg-indigo-100'
                                                }`}>
                                                {result.type === 'qr' ? (
                                                    <Maximize2 className="h-4 w-4 text-purple-600" />
                                                ) : (
                                                    <Scan className="h-4 w-4 text-indigo-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{result.data}</p>
                                                <p className="text-xs text-gray-500">
                                                    {result.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                                            {result.confidence}%
                                        </span>
                                    </div>

                                    {result.packageInfo && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="text-gray-500">SKU</p>
                                                    <p className="font-semibold">{result.packageInfo.sku}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Status</p>
                                                    <p className="font-semibold text-green-600">{result.packageInfo.status}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-2">{result.packageInfo.name}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
