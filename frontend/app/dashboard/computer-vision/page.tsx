'use client';

import { useState, useEffect } from 'react';
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
    const [torchOn, setTorchOn] = useState(false);

    // Dynamic import for the scanner to avoid SSR issues
    const [BarcodeScanner, setBarcodeScanner] = useState<any>(null);

    useEffect(() => {
        import('react-qr-barcode-scanner').then(mod => {
            setBarcodeScanner(() => mod.default);
        });
    }, []);

    const startCamera = () => {
        setCameraActive(true);
        setScanning(true);
    };

    const stopCamera = () => {
        setCameraActive(false);
        setScanning(false);
    };

    const handleScan = (err: any, result: any) => {
        if (result) {
            const text = result.text;
            // Check if we already scanned this recently to avoid duplicates
            const lastScan = scanResults[0];
            if (lastScan && lastScan.data === text && (new Date().getTime() - lastScan.timestamp.getTime() < 2000)) {
                return;
            }

            const newScan: ScanResult = {
                id: Math.random().toString(36).substr(2, 9),
                type: selectedMode === 'qr' ? 'qr' : 'barcode',
                data: text,
                timestamp: new Date(),
                confidence: 0.99,
                packageInfo: {
                    sku: text,
                    name: `Scanned Item ${text.substring(0, 4)}`,
                    status: 'Identified'
                }
            };
            setScanResults(prev => [newScan, ...prev]);
        }
    };

    const stats = {
        totalScans: scanResults.length,
        successful: scanResults.filter(s => s.confidence > 0.8).length,
        avgConfidence: scanResults.length > 0 ? Math.round(scanResults.reduce((acc, s) => acc + s.confidence, 0) / scanResults.length * 100) : 0
    };

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Scan className="h-8 w-8 text-blue-400" />
                        Computer Vision
                    </h1>
                    <p className="text-gray-400 mt-1">AI-powered visual analysis and scanning</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition border border-gray-700">
                        <Settings className="h-4 w-4" /> Configure
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Camera Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-black rounded-2xl overflow-hidden relative aspect-video border border-gray-700 shadow-2xl">
                        {cameraActive && BarcodeScanner ? (
                            <div className="w-full h-full relative">
                                <BarcodeScanner
                                    width="100%"
                                    height="100%"
                                    onUpdate={handleScan}
                                    torch={torchOn}
                                />
                                {/* Overlay UI */}
                                <div className="absolute inset-0 pointer-events-none border-2 border-blue-500/30">
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-48 border-2 border-blue-400 rounded-lg bg-blue-400/10 animate-pulse"></div>
                                    <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-xs text-green-400 flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        LIVE FEED
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-900">
                                <Camera className="h-16 w-16 mb-4 opacity-50" />
                                <p>Camera is offline</p>
                                <button
                                    onClick={startCamera}
                                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                                >
                                    <Play className="h-4 w-4" /> Start Camera
                                </button>
                            </div>
                        )}

                        {/* Camera Controls */}
                        {cameraActive && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex justify-center gap-4">
                                <button
                                    onClick={stopCamera}
                                    className="p-3 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition backdrop-blur-sm"
                                >
                                    <Pause className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={() => setTorchOn(!torchOn)}
                                    className={`p-3 rounded-full transition backdrop-blur-sm ${torchOn ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700/50 text-white'}`}
                                >
                                    <Zap className="h-6 w-6" />
                                </button>
                                <button className="p-3 rounded-full bg-gray-700/50 text-white hover:bg-gray-600/50 transition backdrop-blur-sm">
                                    <Maximize2 className="h-6 w-6" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-gray-400 uppercase font-semibold">Total Scans</p>
                                <Scan className="h-4 w-4 text-indigo-400" />
                            </div>
                            <p className="text-2xl font-bold text-gray-100">{stats.totalScans}</p>
                        </div>
                        <div className="bg-green-900/20 rounded-xl border border-green-700/50 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-green-400 uppercase font-semibold">Successful</p>
                                <CheckCircle className="h-4 w-4 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold text-green-200">{stats.successful}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-gray-400 uppercase font-semibold">Avg Confidence</p>
                                <BarChart3 className="h-4 w-4 text-purple-400" />
                            </div>
                            <p className="text-2xl font-bold text-gray-100">{stats.avgConfidence}%</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Recent Scans */}
                <div className="space-y-6">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-sm h-full">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-gray-400" />
                            Recent Scans
                        </h2>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {scanResults.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Scan className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No scans yet</p>
                                    <p className="text-sm mt-1">Start the camera to begin</p>
                                </div>
                            ) : (
                                scanResults.map((scan) => (
                                    <div key={scan.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition group">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                                    {scan.type === 'qr' ? <Scan className="h-4 w-4 text-blue-400" /> : <Package className="h-4 w-4 text-purple-400" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white text-sm">{scan.packageInfo?.name || 'Unknown Item'}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{scan.data}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">{scan.timestamp.toLocaleTimeString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800">
                                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">
                                                {scan.packageInfo?.status}
                                            </span>
                                            <button className="text-gray-400 hover:text-white transition">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
