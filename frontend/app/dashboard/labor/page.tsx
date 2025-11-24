'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Clock,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    PlayCircle,
    StopCircle,
    BarChart3,
    Activity,
    Award,
    AlertTriangle,
    RefreshCw,
    X
} from 'lucide-react';

interface Employee {
    id: number;
    name: string;
    role: string;
    hourly_rate: number;
    status: 'clocked_in' | 'clocked_out' | 'on_break';
    clock_in_time?: string;
    total_hours_today: number;
    productivity_score: number;
}

interface TimeEntry {
    id: number;
    employee_id: number;
    employee_name: string;
    clock_in: string;
    clock_out?: string;
    break_duration: number;
    total_hours: number;
    labor_cost: number;
    date: string;
}

interface Shift {
    id: number;
    employee_id: number;
    employee_name: string;
    shift_type: string;
    start_time: string;
    end_time: string;
    date: string;
    status: 'scheduled' | 'completed' | 'missed';
}

export default function LaborPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'timeclock' | 'schedule' | 'analytics'>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Form state
    const [employeeForm, setEmployeeForm] = useState({
        name: '',
        role: '',
        hourly_rate: '',
        email: ''
    });

    const [scheduleForm, setScheduleForm] = useState({
        employee_id: '',
        shift_type: 'morning',
        start_time: '08:00',
        end_time: '16:00',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Simulated data - replace with actual API calls
            const mockEmployees: Employee[] = [
                {
                    id: 1,
                    name: 'John Smith',
                    role: 'Warehouse Associate',
                    hourly_rate: 18.50,
                    status: 'clocked_in',
                    clock_in_time: new Date(Date.now() - 4 * 3600000).toISOString(),
                    total_hours_today: 4.2,
                    productivity_score: 92
                },
                {
                    id: 2,
                    name: 'Sarah Johnson',
                    role: 'Forklift Operator',
                    hourly_rate: 22.00,
                    status: 'clocked_in',
                    clock_in_time: new Date(Date.now() - 3.5 * 3600000).toISOString(),
                    total_hours_today: 3.5,
                    productivity_score: 88
                },
                {
                    id: 3,
                    name: 'Mike Davis',
                    role: 'Picker',
                    hourly_rate: 17.00,
                    status: 'on_break',
                    clock_in_time: new Date(Date.now() - 5 * 3600000).toISOString(),
                    total_hours_today: 4.8,
                    productivity_score: 95
                },
                {
                    id: 4,
                    name: 'Emily Brown',
                    role: 'Supervisor',
                    hourly_rate: 28.00,
                    status: 'clocked_out',
                    total_hours_today: 0,
                    productivity_score: 90
                }
            ];

            const mockTimeEntries: TimeEntry[] = [
                {
                    id: 1,
                    employee_id: 1,
                    employee_name: 'John Smith',
                    clock_in: new Date(Date.now() - 86400000).toISOString(),
                    clock_out: new Date(Date.now() - 86400000 + 8 * 3600000).toISOString(),
                    break_duration: 30,
                    total_hours: 7.5,
                    labor_cost: 138.75,
                    date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
                },
                {
                    id: 2,
                    employee_id: 2,
                    employee_name: 'Sarah Johnson',
                    clock_in: new Date(Date.now() - 86400000).toISOString(),
                    clock_out: new Date(Date.now() - 86400000 + 8 * 3600000).toISOString(),
                    break_duration: 30,
                    total_hours: 7.5,
                    labor_cost: 165.00,
                    date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
                }
            ];

            const mockShifts: Shift[] = [
                {
                    id: 1,
                    employee_id: 1,
                    employee_name: 'John Smith',
                    shift_type: 'Morning',
                    start_time: '08:00',
                    end_time: '16:00',
                    date: new Date().toISOString().split('T')[0],
                    status: 'scheduled'
                },
                {
                    id: 2,
                    employee_id: 2,
                    employee_name: 'Sarah Johnson',
                    shift_type: 'Morning',
                    start_time: '08:00',
                    end_time: '16:00',
                    date: new Date().toISOString().split('T')[0],
                    status: 'scheduled'
                },
                {
                    id: 3,
                    employee_id: 3,
                    employee_name: 'Mike Davis',
                    shift_type: 'Afternoon',
                    start_time: '14:00',
                    end_time: '22:00',
                    date: new Date().toISOString().split('T')[0],
                    status: 'scheduled'
                }
            ];

            setEmployees(mockEmployees);
            setTimeEntries(mockTimeEntries);
            setShifts(mockShifts);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const stats = {
        totalEmployees: employees.length,
        clockedIn: employees.filter(e => e.status === 'clocked_in').length,
        totalHoursToday: employees.reduce((sum, e) => sum + e.total_hours_today, 0),
        laborCostToday: employees.reduce((sum, e) => sum + (e.total_hours_today * e.hourly_rate), 0),
        avgProductivity: employees.reduce((sum, e) => sum + e.productivity_score, 0) / employees.length
    };

    const handleClockIn = async (employeeId: number) => {
        try {
            // In production, make API call
            console.log('Clocking in employee:', employeeId);
            await fetchData();
        } catch (error) {
            console.error('Error clocking in:', error);
        }
    };

    const handleClockOut = async (employeeId: number) => {
        try {
            // In production, make API call
            console.log('Clocking out employee:', employeeId);
            await fetchData();
        } catch (error) {
            console.error('Error clocking out:', error);
        }
    };

    const handleAddEmployee = async () => {
        try {
            // In production, make API call
            console.log('Adding employee:', employeeForm);
            await fetchData();
            setShowAddEmployeeModal(false);
            setEmployeeForm({ name: '', role: '', hourly_rate: '', email: '' });
        } catch (error) {
            console.error('Error adding employee:', error);
        }
    };

    const handleScheduleShift = async () => {
        try {
            // In production, make API call
            console.log('Scheduling shift:', scheduleForm);
            await fetchData();
            setShowScheduleModal(false);
        } catch (error) {
            console.error('Error scheduling shift:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { text: string; color: string; icon: any }> = {
            clocked_in: { text: 'Clocked In', color: 'green', icon: CheckCircle },
            clocked_out: { text: 'Clocked Out', color: 'gray', icon: XCircle },
            on_break: { text: 'On Break', color: 'yellow', icon: Clock }
        };

        const badge = badges[status] || badges.clocked_out;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${badge.color === 'green' ? 'bg-green-100 text-green-700' :
                    badge.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'}`}>
                <Icon className="h-3 w-3" />
                {badge.text}
            </span>
        );
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Labor Management</h1>
                    <p className="text-gray-600 mt-1">Track time, productivity, and labor costs</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowAddEmployeeModal(true)}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Add Employee
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Employees</p>
                        <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                    <p className="text-xs text-gray-500 mt-1">Active workforce</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Clocked In</p>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.clockedIn}</p>
                    <p className="text-xs text-green-600 mt-1">Currently working</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Hours Today</p>
                        <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalHoursToday.toFixed(1)}</p>
                    <p className="text-xs text-purple-600 mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Total logged
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Labor Cost Today</p>
                        <DollarSign className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${stats.laborCostToday.toFixed(2)}</p>
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Operating cost
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Avg Productivity</p>
                        <Award className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.avgProductivity.toFixed(0)}%</p>
                    <p className="text-xs text-yellow-600 mt-1">Performance score</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="border-b border-gray-200">
                    <div className="flex gap-4 px-6">
                        {[
                            { id: 'overview', label: 'Overview', icon: Users },
                            { id: 'timeclock', label: 'Time Clock', icon: Clock },
                            { id: 'schedule', label: 'Schedule', icon: Calendar },
                            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search employees..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Export
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredEmployees.map((employee) => (
                                    <div key={employee.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                                                <p className="text-sm text-gray-600">{employee.role}</p>
                                            </div>
                                            {getStatusBadge(employee.status)}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Hourly Rate</p>
                                                <p className="text-sm font-semibold text-gray-900">${employee.hourly_rate}/hr</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Hours Today</p>
                                                <p className="text-sm font-semibold text-gray-900">{employee.total_hours_today.toFixed(1)}h</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Productivity</p>
                                                <p className="text-sm font-semibold text-green-600">{employee.productivity_score}%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Cost Today</p>
                                                <p className="text-sm font-semibold text-red-600">
                                                    ${(employee.total_hours_today * employee.hourly_rate).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {employee.status === 'clocked_in' && employee.clock_in_time && (
                                            <div className="mb-3 p-2 bg-green-50 rounded text-xs text-green-700">
                                                Clocked in at {new Date(employee.clock_in_time).toLocaleTimeString()}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            {employee.status === 'clocked_out' ? (
                                                <button
                                                    onClick={() => handleClockIn(employee.id)}
                                                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition flex items-center justify-center gap-2"
                                                >
                                                    <PlayCircle className="h-4 w-4" />
                                                    Clock In
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleClockOut(employee.id)}
                                                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition flex items-center justify-center gap-2"
                                                >
                                                    <StopCircle className="h-4 w-4" />
                                                    Clock Out
                                                </button>
                                            )}
                                            <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Time Clock Tab */}
                    {activeTab === 'timeclock' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Time Entries</h3>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Clock In</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Clock Out</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Break (min)</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Hours</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Labor Cost</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {timeEntries.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                    No time entries for selected date
                                                </td>
                                            </tr>
                                        ) : (
                                            timeEntries.map((entry) => (
                                                <tr key={entry.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                        {entry.employee_name}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {new Date(entry.clock_in).toLocaleTimeString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {entry.clock_out ? new Date(entry.clock_out).toLocaleTimeString() : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{entry.break_duration}</td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                                        {entry.total_hours.toFixed(2)}h
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                                        ${entry.labor_cost.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button className="p-1 hover:bg-gray-100 rounded transition">
                                                                <Edit className="h-4 w-4 text-gray-600" />
                                                            </button>
                                                            <button className="p-1 hover:bg-red-50 rounded transition">
                                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Schedule Tab */}
                    {activeTab === 'schedule' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Shift Schedule</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <button
                                        onClick={() => setShowScheduleModal(true)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Schedule Shift
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['Morning', 'Afternoon', 'Night'].map((shiftType) => (
                                    <div key={shiftType} className="border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                            {shiftType} Shift
                                        </h4>
                                        <div className="space-y-2">
                                            {shifts
                                                .filter(s => s.shift_type === shiftType && s.date === selectedDate)
                                                .map((shift) => (
                                                    <div key={shift.id} className="p-3 bg-gray-50 rounded-lg">
                                                        <p className="font-medium text-sm text-gray-900">{shift.employee_name}</p>
                                                        <p className="text-xs text-gray-600">
                                                            {shift.start_time} - {shift.end_time}
                                                        </p>
                                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${shift.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                shift.status === 'missed' ? 'bg-red-100 text-red-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {shift.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            {shifts.filter(s => s.shift_type === shiftType && s.date === selectedDate).length === 0 && (
                                                <p className="text-sm text-gray-500 text-center py-4">No shifts scheduled</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Productivity Chart */}
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        Productivity by Employee
                                    </h3>
                                    <div className="space-y-3">
                                        {employees.map((emp) => (
                                            <div key={emp.id}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-700">{emp.name}</span>
                                                    <span className="text-sm font-semibold text-gray-900">{emp.productivity_score}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${emp.productivity_score >= 90 ? 'bg-green-600' :
                                                                emp.productivity_score >= 75 ? 'bg-blue-600' :
                                                                    emp.productivity_score >= 60 ? 'bg-yellow-600' :
                                                                        'bg-red-600'
                                                            }`}
                                                        style={{ width: `${emp.productivity_score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Labor Cost Breakdown */}
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                        Labor Cost Breakdown
                                    </h3>
                                    <div className="space-y-3">
                                        {employees.map((emp) => {
                                            const cost = emp.total_hours_today * emp.hourly_rate;
                                            const percentage = (cost / stats.laborCostToday) * 100;
                                            return (
                                                <div key={emp.id}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium text-gray-700">{emp.name}</span>
                                                        <span className="text-sm font-semibold text-gray-900">${cost.toFixed(2)}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-600 h-2 rounded-full"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Hours Distribution */}
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-purple-600" />
                                        Hours Distribution
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Regular Hours</span>
                                            <span className="text-lg font-bold text-blue-600">{stats.totalHoursToday.toFixed(1)}h</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Overtime Hours</span>
                                            <span className="text-lg font-bold text-yellow-600">0.0h</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Break Time</span>
                                            <span className="text-lg font-bold text-purple-600">1.5h</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Performers */}
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Award className="h-5 w-5 text-yellow-600" />
                                        Top Performers
                                    </h3>
                                    <div className="space-y-3">
                                        {[...employees]
                                            .sort((a, b) => b.productivity_score - a.productivity_score)
                                            .slice(0, 3)
                                            .map((emp, index) => (
                                                <div key={emp.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                                            index === 1 ? 'bg-gray-400' :
                                                                'bg-orange-400'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{emp.name}</p>
                                                        <p className="text-xs text-gray-600">{emp.role}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-green-600">{emp.productivity_score}%</p>
                                                        <p className="text-xs text-gray-600">{emp.total_hours_today.toFixed(1)}h</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Employee Modal */}
            {showAddEmployeeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
                            <button
                                onClick={() => setShowAddEmployeeModal(false)}
                                className="p-1 hover:bg-gray-100 rounded transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={employeeForm.name}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={employeeForm.role}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select role</option>
                                    <option value="Warehouse Associate">Warehouse Associate</option>
                                    <option value="Forklift Operator">Forklift Operator</option>
                                    <option value="Picker">Picker</option>
                                    <option value="Packer">Packer</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Manager">Manager</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={employeeForm.email}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={employeeForm.hourly_rate}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, hourly_rate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="18.50"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddEmployeeModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddEmployee}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                            >
                                Add Employee
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Shift Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Schedule Shift</h2>
                            <button
                                onClick={() => setShowScheduleModal(false)}
                                className="p-1 hover:bg-gray-100 rounded transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                                <select
                                    value={scheduleForm.employee_id}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, employee_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select employee</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
                                <select
                                    value={scheduleForm.shift_type}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, shift_type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Morning">Morning (8:00 - 16:00)</option>
                                    <option value="Afternoon">Afternoon (14:00 - 22:00)</option>
                                    <option value="Night">Night (22:00 - 06:00)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={scheduleForm.start_time}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        value={scheduleForm.end_time}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={scheduleForm.date}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowScheduleModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleScheduleShift}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                            >
                                Schedule Shift
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
