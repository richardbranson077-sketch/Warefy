'use client';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account and application preferences</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <input
                            type="text"
                            defaultValue="Warefy Logistics"
                            className="w-full max-w-md border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                        <select className="w-full max-w-md border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500">
                            <option>UTC (GMT+00:00)</option>
                            <option>EST (GMT-05:00)</option>
                            <option>PST (GMT-08:00)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="email_alerts" defaultChecked className="h-4 w-4 text-primary-600 rounded border-gray-300" />
                        <label htmlFor="email_alerts" className="text-gray-700">Email Alerts for Critical Anomalies</label>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="sms_alerts" className="h-4 w-4 text-primary-600 rounded border-gray-300" />
                        <label htmlFor="sms_alerts" className="text-gray-700">SMS Notifications for Drivers</label>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="weekly_report" defaultChecked className="h-4 w-4 text-primary-600 rounded border-gray-300" />
                        <label htmlFor="weekly_report" className="text-gray-700">Weekly AI Performance Report</label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
