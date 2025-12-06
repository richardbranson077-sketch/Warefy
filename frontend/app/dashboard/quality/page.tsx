'use client';

import { useState, useEffect } from 'react';
import {
    Shield,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Plus,
    Search,
    FileText,
    Camera,
    BarChart2,
    Truck,
    Package,
    ClipboardCheck,
    AlertOctagon
} from 'lucide-react';
import {
    qualityService,
    QualityInspection,
    DefectReport,
    SupplierScore,
    DefectTrends
} from '@/services/quality.service';
import { LoadingSpinner } from '@/components/LoadingStates';

export default function QualityControlPage() {
    const [activeTab, setActiveTab] = useState<'inspections' | 'defects' | 'suppliers'>('inspections');
    const [inspections, setInspections] = useState<QualityInspection[]>([]);
    const [defects, setDefects] = useState<DefectReport[]>([]);
    const [trends, setTrends] = useState<DefectTrends | null>(null);
    const [loading, setLoading] = useState(true);
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [showDefectModal, setShowDefectModal] = useState(false);

    // Forms
    const [inspectionForm, setInspectionForm] = useState<Partial<QualityInspection>>({
        inspection_type: 'receiving',
        checklist: [
            { item_name: 'Packaging Condition', passed: true },
            { item_name: 'Label Accuracy', passed: true },
            { item_name: 'Product Integrity', passed: true }
        ],
        overall_result: 'pass'
    });

    const [defectForm, setDefectForm] = useState<Partial<DefectReport>>({
        defect_type: 'damaged',
        severity: 'minor',
        status: 'open'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [inspectionsData, defectsData, trendsData] = await Promise.all([
                qualityService.getInspections(),
                qualityService.getDefects(),
                qualityService.getDefectTrends()
            ]);
            setInspections(inspectionsData);
            setDefects(defectsData);
            setTrends(trendsData);
        } catch (err) {
            console.error('Failed to load quality data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInspection = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await qualityService.createInspection(inspectionForm as QualityInspection);
            setShowInspectionModal(false);
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleReportDefect = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await qualityService.reportDefect(defectForm as DefectReport);
            setShowDefectModal(false);
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleResolveDefect = async (id: number) => {
        try {
            await qualityService.updateDefectStatus(id, 'resolved', 'Resolved via dashboard');
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="h-8 w-8 text-teal-600" />
                        Quality Control Center
                    </h1>
                    <p className="text-gray-500 mt-1">Monitor inspections, track defects, and manage supplier quality</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowDefectModal(true)}
                        className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition shadow-sm"
                    >
                        <AlertTriangle className="h-5 w-5" />
                        Report Defect
                    </button>
                    <button
                        onClick={() => setShowInspectionModal(true)}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
                    >
                        <ClipboardCheck className="h-5 w-5" />
                        New Inspection
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pass Rate (30d)</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {inspections.length ? ((inspections.filter(i => i.overall_result === 'pass').length / inspections.length) * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                        <div className="p-3 bg-teal-50 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-teal-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Open Defects</p>
                            <p className="text-2xl font-bold text-red-600">
                                {defects.filter(d => d.status === 'open').length}
                            </p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                            <AlertOctagon className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Critical Issues</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {defects.filter(d => d.severity === 'critical').length}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Top Defect</p>
                            <p className="text-lg font-bold text-gray-900 truncate max-w-[120px]">
                                {trends?.top_defect_type || 'None'}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <BarChart2 className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('inspections')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'inspections'
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Inspection Log
                        </button>
                        <button
                            onClick={() => setActiveTab('defects')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'defects'
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Defect Tracking
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'inspections' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspector</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {inspections.map((inspection) => (
                                        <tr key={inspection.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(inspection.created_at || '').toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                                                    {inspection.inspection_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {inspection.sku}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${inspection.overall_result === 'pass' ? 'bg-green-100 text-green-800' :
                                                        inspection.overall_result === 'fail' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {inspection.overall_result.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ID: {inspection.inspector_id}
                                            </td>
                                        </tr>
                                    ))}
                                    {inspections.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                No inspections recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'defects' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {defects.map((defect) => (
                                        <tr key={defect.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(defect.reported_at || '').toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {defect.sku}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                {defect.defect_type.replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${defect.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                        defect.severity === 'major' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-blue-100 text-blue-800'}`}>
                                                    {defect.severity.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${defect.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                                    {defect.status?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {defect.status === 'open' && (
                                                    <button
                                                        onClick={() => handleResolveDefect(defect.id!)}
                                                        className="text-teal-600 hover:text-teal-900"
                                                    >
                                                        Mark Resolved
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {defects.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                No defects reported.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Inspection Modal */}
            {showInspectionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">New Quality Inspection</h2>
                            <button onClick={() => setShowInspectionModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateInspection} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Type</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        value={inspectionForm.inspection_type}
                                        onChange={e => setInspectionForm({ ...inspectionForm, inspection_type: e.target.value as any })}
                                    >
                                        <option value="receiving">Receiving</option>
                                        <option value="picking">Picking</option>
                                        <option value="packing">Packing</option>
                                        <option value="shipping">Shipping</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2"
                                        value={inspectionForm.sku || ''}
                                        onChange={e => setInspectionForm({ ...inspectionForm, sku: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Checklist</label>
                                <div className="space-y-2">
                                    {inspectionForm.checklist?.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium">{item.item_name}</span>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newChecklist = [...(inspectionForm.checklist || [])];
                                                        newChecklist[idx].passed = true;
                                                        setInspectionForm({ ...inspectionForm, checklist: newChecklist });
                                                    }}
                                                    className={`px-3 py-1 rounded text-xs font-medium ${item.passed ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
                                                >
                                                    Pass
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newChecklist = [...(inspectionForm.checklist || [])];
                                                        newChecklist[idx].passed = false;
                                                        setInspectionForm({ ...inspectionForm, checklist: newChecklist });
                                                    }}
                                                    className={`px-3 py-1 rounded text-xs font-medium ${!item.passed ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-500'}`}
                                                >
                                                    Fail
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Overall Result</label>
                                <select
                                    className="w-full border rounded-lg p-2"
                                    value={inspectionForm.overall_result}
                                    onChange={e => setInspectionForm({ ...inspectionForm, overall_result: e.target.value as any })}
                                >
                                    <option value="pass">Pass</option>
                                    <option value="fail">Fail</option>
                                    <option value="conditional">Conditional Pass</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowInspectionModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Submit Inspection</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Defect Modal */}
            {showDefectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Report Defect</h2>
                            <button onClick={() => setShowDefectModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleReportDefect} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={defectForm.sku || ''}
                                    onChange={e => setDefectForm({ ...defectForm, sku: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={defectForm.supplier || ''}
                                    onChange={e => setDefectForm({ ...defectForm, supplier: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        value={defectForm.defect_type}
                                        onChange={e => setDefectForm({ ...defectForm, defect_type: e.target.value as any })}
                                    >
                                        <option value="damaged">Damaged</option>
                                        <option value="wrong_item">Wrong Item</option>
                                        <option value="missing_parts">Missing Parts</option>
                                        <option value="quality_issue">Quality Issue</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        value={defectForm.severity}
                                        onChange={e => setDefectForm({ ...defectForm, severity: e.target.value as any })}
                                    >
                                        <option value="minor">Minor</option>
                                        <option value="major">Major</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full border rounded-lg p-2"
                                    rows={3}
                                    value={defectForm.description || ''}
                                    onChange={e => setDefectForm({ ...defectForm, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowDefectModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Submit Report</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
