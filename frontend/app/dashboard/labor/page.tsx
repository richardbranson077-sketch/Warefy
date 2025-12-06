'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Clock,
    DollarSign,
    TrendingUp,
    Calendar,
    PlayCircle,
    StopCircle,
    Award,
    Briefcase,
    Plus,
    X,
    User
} from 'lucide-react';
import {
    laborService,
    Employee,
    ShiftSchedule,
    TeamPerformance,
    TimeClockEntry,
    LaborCostAnalytics
} from '@/services/labor.service';
import { LoadingSpinner } from '@/components/LoadingStates';

export default function LaborManagementPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'performance'>('overview');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [performance, setPerformance] = useState<TeamPerformance[]>([]);
    const [schedules, setSchedules] = useState<ShiftSchedule[]>([]);
    const [timesheet, setTimesheet] = useState<TimeClockEntry[]>([]);
    const [laborCosts, setLaborCosts] = useState<LaborCostAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [isClockedIn, setIsClockedIn] = useState(false);

    // Schedule Form
    const [scheduleForm, setScheduleForm] = useState<Partial<ShiftSchedule>>({
        shift_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        role: 'picker'
    });

    const [showBreakModal, setShowBreakModal] = useState(false);
    const [breakMinutes, setBreakMinutes] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const today = new Date();
            const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

            const [emps, perf, scheds, time, costs] = await Promise.all([
                laborService.getEmployees(),
                laborService.getTeamPerformance(30),
                laborService.getSchedules(),
                laborService.getTimesheet(),
                laborService.getLaborCosts(lastWeek.toISOString(), today.toISOString())
            ]);

            setEmployees(emps);
            setPerformance(perf);
            setSchedules(scheds);
            setTimesheet(time.entries);
            setLaborCosts(costs);

            // Check if currently clocked in
            const lastEntry = time.entries[time.entries.length - 1];
            if (lastEntry && !lastEntry.clock_out) {
                setIsClockedIn(true);
            }
        } catch (err) {
            console.error('Failed to load labor data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClockAction = () => {
        if (isClockedIn) {
            setShowBreakModal(true);
        } else {
            handleClockIn();
        }
    };

    const handleClockIn = async () => {
        try {
            await laborService.clockIn();
            setIsClockedIn(true);
            refreshTimesheet();
        } catch (err) {
            console.error(err);
            alert('Failed to clock in');
        }
    };

    const handleClockOut = async () => {
        try {
            await laborService.clockOut(breakMinutes);
            setIsClockedIn(false);
            setShowBreakModal(false);
            setBreakMinutes(0);
            refreshTimesheet();
        } catch (err) {
            console.error(err);
            alert('Failed to clock out');
        }
    };

    const refreshTimesheet = async () => {
        const time = await laborService.getTimesheet();
        setTimesheet(time.entries);
    };

    const handleCreateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await laborService.createSchedule(scheduleForm as ShiftSchedule);
            setShowScheduleModal(false);
            const scheds = await laborService.getSchedules();
            setSchedules(scheds);
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
                        <Users className="h-8 w-8 text-amber-600" />
                        Labor Management
                    </h1>
                    <p className="text-gray-500 mt-1">Workforce planning, time tracking, and performance analytics</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium">MY STATUS</p>
                            <p className={`text-sm font-bold ${isClockedIn ? 'text-green-600' : 'text-gray-600'}`}>
                                {isClockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}
                            </p>
                        </div>
                        <button
                            onClick={handleClockAction}
                            className={`p-3 rounded-full transition-colors ${isClockedIn
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                                }`}
                        >
                            {isClockedIn ? <StopCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
                        </button>
                    </div>
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition shadow-sm h-12"
                    >
                        <Calendar className="h-5 w-5" />
                        Assign Shift
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Employees</p>
                            <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <Users className="h-6 w-6 text-amber-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Hours (7d)</p>
                            <p className="text-2xl font-bold text-blue-600">{laborCosts?.total_hours || 0}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Labor Cost (7d)</p>
                            <p className="text-2xl font-bold text-green-600">${laborCosts?.total_labor_cost || 0}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Cost per Order</p>
                            <p className="text-2xl font-bold text-purple-600">${laborCosts?.cost_per_order || 0}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview'
                                ? 'border-amber-500 text-amber-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('schedule')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'schedule'
                                ? 'border-amber-500 text-amber-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Shift Schedule
                        </button>
                        <button
                            onClick={() => setActiveTab('performance')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'performance'
                                ? 'border-amber-500 text-amber-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Team Performance
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900">My Recent Timesheet</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock In</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock Out</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Break (min)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {timesheet.slice().reverse().slice(0, 5).map((entry) => {
                                            const clockIn = new Date(entry.clock_in);
                                            const clockOut = entry.clock_out ? new Date(entry.clock_out) : null;
                                            const hours = clockOut
                                                ? ((clockOut.getTime() - clockIn.getTime()) / 3600000 - (entry.break_minutes / 60)).toFixed(2)
                                                : '-';

                                            return (
                                                <tr key={entry.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {clockIn.toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {clockIn.toLocaleTimeString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {clockOut ? clockOut.toLocaleTimeString() : <span className="text-green-600 font-medium">Active</span>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {entry.break_minutes}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {hours}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {timesheet.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                    No time entries found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900">Upcoming Shifts</h3>
                                <div className="text-sm text-gray-500">
                                    Displaying all scheduled shifts
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {schedules.map((shift, idx) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-amber-100 p-2 rounded-full">
                                                    <User className="h-4 w-4 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">User #{shift.user_id}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{shift.role}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                {new Date(shift.shift_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                                            <Clock className="h-4 w-4" />
                                            {shift.start_time} - {shift.end_time}
                                        </div>
                                    </div>
                                ))}
                                {schedules.length === 0 && (
                                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                                        No shifts scheduled. Click "Assign Shift" to create one.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900">Top Performers (30 Days)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Picks/Hr</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {performance.map((p, idx) => (
                                            <tr key={p.user_id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                                        ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                            idx === 1 ? 'bg-gray-200 text-gray-700' :
                                                                idx === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}>
                                                        {idx + 1}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                                    {p.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {p.avg_picks_per_hour}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium
                                                        ${p.avg_accuracy >= 98 ? 'bg-green-100 text-green-700' :
                                                            p.avg_accuracy >= 95 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.avg_accuracy}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {p.total_orders}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-indigo-600">
                                                    {p.score}
                                                </td>
                                            </tr>
                                        ))}
                                        {performance.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                    No performance data available yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Assign Shift</h2>
                            <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSchedule} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                                <select
                                    className="w-full border rounded-lg p-2"
                                    value={scheduleForm.user_id}
                                    onChange={e => setScheduleForm({ ...scheduleForm, user_id: parseInt(e.target.value) })}
                                    required
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(e => (
                                        <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full border rounded-lg p-2"
                                    value={scheduleForm.shift_date}
                                    onChange={e => setScheduleForm({ ...scheduleForm, shift_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        className="w-full border rounded-lg p-2"
                                        value={scheduleForm.start_time}
                                        onChange={e => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        className="w-full border rounded-lg p-2"
                                        value={scheduleForm.end_time}
                                        onChange={e => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    className="w-full border rounded-lg p-2"
                                    value={scheduleForm.role}
                                    onChange={e => setScheduleForm({ ...scheduleForm, role: e.target.value })}
                                >
                                    <option value="picker">Picker</option>
                                    <option value="packer">Packer</option>
                                    <option value="driver">Driver</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">Assign Shift</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Break Time Modal */}
            {showBreakModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Clock Out</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-600">Enter break duration (minutes) if applicable:</p>
                            <input
                                type="number"
                                min="0"
                                className="w-full border rounded-lg p-2"
                                value={breakMinutes}
                                onChange={e => setBreakMinutes(parseInt(e.target.value) || 0)}
                            />
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setShowBreakModal(false)}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClockOut}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Confirm Clock Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
