'use client';

import { useState } from 'react';
import { useAIReports } from '@/hooks/useAIReports';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Brain, FileText, Download, RefreshCw } from 'lucide-react';

export default function AIReportsPage() {
    const { data: aiReports, loading, error, refetch } = useAIReports();
    
    return (
        <>
            {loading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {!loading && !error && (
                <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Brain className="h-8 w-8 text-fuchsia-400" />
                                AI-Generated Reports
                            </h1>
                            <p className="text-gray-400 mt-1">Automated insights and analytics</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {aiReports?.length === 0 ? (
                            <div className="col-span-3 bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
                                <Brain className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No AI reports generated yet</p>
                            </div>
                        ) : (
                            aiReports?.map((report) => (
                                <div key={report.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <FileText className="h-8 w-8 text-fuchsia-400" />
                                        <div>
                                            <h3 className="font-bold">{report.title}</h3>
                                            <p className="text-xs text-gray-500">{new Date(report.generatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4">{report.summary}</p>
                                    <button className="w-full py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg transition flex items-center justify-center gap-2">
                                        <Download className="h-4 w-4" />
                                        Download
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
