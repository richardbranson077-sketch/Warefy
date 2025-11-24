/**
 * useReports Hook
 * React hook for reports data with loading states
 */

import { useState, useEffect, useCallback } from 'react';
import { reportsService, Report, CreateReport, ReportTemplate } from '@/services/reports.service';
import { getErrorMessage } from '@/lib/api';

interface UseReportsOptions {
    type?: string;
    status?: string;
    autoFetch?: boolean;
}

export function useReports(options: UseReportsOptions = {}) {
    const { type, status, autoFetch = true } = options;

    const [data, setData] = useState<Report[]>([]);
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const reports = await reportsService.getAll({ type, status });
            setData(reports);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [type, status]);

    const fetchTemplates = useCallback(async () => {
        try {
            const tmpls = await reportsService.getTemplates();
            setTemplates(tmpls);
        } catch (err: any) {
            console.error('Failed to fetch templates:', err);
        }
    }, []);

    useEffect(() => {
        if (autoFetch) {
            fetchReports();
            fetchTemplates();
        }
    }, [autoFetch, fetchReports, fetchTemplates]);

    const generateReport = async (reportData: CreateReport) => {
        try {
            const newReport = await reportsService.generate(reportData);
            setData([newReport, ...data]);
            return newReport;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const deleteReport = async (id: number) => {
        try {
            await reportsService.delete(id);
            setData(data.filter(report => report.id !== id));
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const downloadReport = async (id: number, filename: string) => {
        try {
            const blob = await reportsService.download(id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    return {
        data,
        templates,
        loading,
        error,
        refetch: fetchReports,
        generateReport,
        deleteReport,
        downloadReport,
    };
}
