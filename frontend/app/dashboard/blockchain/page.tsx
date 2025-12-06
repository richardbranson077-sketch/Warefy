'use client';

import { useState, useEffect } from 'react';
import { blockchainService, AuditLog, ChainStatus } from '@/services/blockchain.service';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    Link,
    Search,
    RefreshCw,
    Package as Server,
    User,
    Clock,
    File,
    Brain as Bot,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BlockchainPage() {
    const [blocks, setBlocks] = useState<AuditLog[]>([]);
    const [chainStatus, setChainStatus] = useState<ChainStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchChain = async () => {
        console.log('🔄 Refresh button clicked - fetching blockchain...');
        setLoading(true);
        try {
            console.log('📡 Calling blockchainService.getBlocks(50)...');
            const data = await blockchainService.getBlocks(50);
            console.log('✅ Received blockchain data:', data);
            setBlocks(data);
            console.log('✅ State updated with', data.length, 'blocks');
        } catch (error: any) {
            console.error('❌ Failed to fetch blockchain:', error);
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
        } finally {
            setLoading(false);
            console.log('✅ Loading state set to false');
        }
    };

    const verifyIntegrity = async () => {
        setVerifying(true);
        try {
            const status = await blockchainService.verifyChain();
            setChainStatus(status);
        } catch (error) {
            console.error('Verification failed:', error);
        } finally {
            setVerifying(false);
        }
    };

    const analyzeChain = async () => {
        setAnalyzing(true);
        try {
            const result = await blockchainService.analyzeChain(searchQuery || "Analyze recent activity for anomalies.");
            setAiAnalysis(result.analysis);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    useEffect(() => {
        fetchChain();
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Link className="h-8 w-8 text-blue-600" />
                        Audit Trail & Blockchain
                    </h1>
                    <p className="text-gray-500 mt-1">Immutable ledger of all system activities with cryptographic verification.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchChain}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={verifyIntegrity}
                        disabled={verifying}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${chainStatus?.isValid === false
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {verifying ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : chainStatus?.isValid ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : chainStatus?.isValid === false ? (
                            <AlertTriangle className="h-4 w-4" />
                        ) : (
                            <Shield className="h-4 w-4" />
                        )}
                        {verifying ? 'Verifying...' : 'Verify Integrity'}
                    </button>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Total Blocks</h3>
                        <Server className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{blocks.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Recorded transactions</p>
                </div>

                <div className={`p-6 rounded-xl shadow-sm border ${chainStatus?.isValid === false
                        ? 'bg-red-50 border-red-200'
                        : chainStatus?.isValid
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200'
                    } `}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-sm font-medium ${chainStatus?.isValid === false ? 'text-red-600' : chainStatus?.isValid ? 'text-green-600' : 'text-gray-500'
                            } `}>Chain Status</h3>
                        {chainStatus?.isValid === false ? (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : chainStatus?.isValid ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                            <Shield className="h-5 w-5 text-gray-400" />
                        )}
                    </div>
                    <p className={`text-xl font-bold ${chainStatus?.isValid === false ? 'text-red-700' : chainStatus?.isValid ? 'text-green-700' : 'text-gray-700'
                        } `}>
                        {chainStatus ? (chainStatus.isValid ? 'Secure & Verified' : 'Tampering Detected') : 'Unverified'}
                    </p>
                    {chainStatus?.message && (
                        <p className={`text-xs mt-1 ${chainStatus.isValid === false ? 'text-red-600' : 'text-green-600'
                            } `}>
                            {chainStatus.message}
                        </p>
                    )}
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl shadow-sm border border-purple-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-purple-600">AI Auditor</h3>
                        <Bot className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Ask about logs..."
                            className="flex-1 text-sm border-gray-200 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && analyzeChain()}
                        />
                        <button
                            onClick={analyzeChain}
                            disabled={analyzing}
                            className="bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700 transition-colors"
                        >
                            {analyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Analysis Result */}
            {aiAnalysis && (
                <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
                    <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex items-center gap-2">
                        <Bot className="h-5 w-5 text-purple-600" />
                        <h3 className="font-semibold text-purple-900">AI Audit Report</h3>
                    </div>
                    <div className="p-6 prose prose-purple max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiAnalysis}</ReactMarkdown>
                    </div>
                </div>
            )}

            {/* Blockchain Visualizer */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Blocks</h2>
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

                    <div className="space-y-6">
                        {blocks.map((block, index) => (
                            <div key={block.id} className="relative pl-20 group">
                                {/* Connector Node */}
                                <div className={`absolute left-6 top-6 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 ${index === 0 ? 'bg-green-500' : 'bg-blue-500'
                                    } `} />

                                {/* Block Card */}
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded">
                                                    Block #{block.id}
                                                </span>
                                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(block.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {block.action}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-3">
                                                {block.details || 'No details provided'}
                                            </p>

                                            {/* Metadata / Extra Data */}
                                            {block.extra_data && (
                                                <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono text-gray-600 overflow-x-auto">
                                                    {JSON.stringify(block.extra_data, null, 2)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 min-w-[200px]">
                                            <div className="text-xs">
                                                <span className="text-gray-400 block mb-1">Hash</span>
                                                <div className="font-mono bg-gray-50 p-1.5 rounded text-gray-600 truncate max-w-[200px]" title={block.hash}>
                                                    {block.hash?.substring(0, 16)}...
                                                </div>
                                            </div>
                                            <div className="text-xs">
                                                <span className="text-gray-400 block mb-1">Previous Hash</span>
                                                <div className="font-mono bg-gray-50 p-1.5 rounded text-gray-400 truncate max-w-[200px]" title={block.previous_hash}>
                                                    {block.previous_hash?.substring(0, 16)}...
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <User className="h-3 w-3 text-gray-400" />
                                                <span className="text-xs text-gray-500">User ID: {block.user_id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
