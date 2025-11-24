import { useState, useEffect } from 'react';
import * as aiReportService from '../services/aiReports.service';
import { AIReport } from '../services/aiReports.service';

export const useAIReports = () => {
    const [reports, setReports] = useState<AIReport[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await aiReportService.getReports();
            setReports(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const createReport = async (report: Partial<AIReport>) => {
        setLoading(true);
        try {
            const newReport = await aiReportService.createReport(report);
            setReports(prev => [...prev, newReport]);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const deleteReport = async (id: string) => {
        setLoading(true);
        try {
            await aiReportService.deleteReport(id);
            setReports(prev => prev.filter(r => r.id !== id));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return { reports, loading, error, fetchReports, createReport, deleteReport };
};
