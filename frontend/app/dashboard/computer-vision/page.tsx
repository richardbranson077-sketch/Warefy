'use client';

import { useComputerVision } from '@/hooks/useComputerVision';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Camera, Eye, Scan, RefreshCw } from 'lucide-react';

export default function ComputerVisionPage() {
    const { data: visionData, loading, error, refetch } = useComputerVision();

    const stats = {
        totalScans: visionData?.scans?.length || 0,
        accuracy: visionData?.averageAccuracy || 0,
        processed: visionData?.processedToday || 0
    };

    return (
        <>
            {loading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {!loading && !error && (
                <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Camera className="h-8 w-8 text-pink-400" />
                                Computer Vision
                            </h1>
                            <p className="text-gray-400 mt-1">AI-powered image analysis</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Scans</p>
                                <Scan className="h-5 w-5 text-pink-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalScans}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Accuracy</p>
                                <Eye className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.accuracy.toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Processed Today</p>
                                <Camera className="h-5 w-5 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.processed}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
