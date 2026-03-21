import React from 'react';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Users', value: '1,234', icon: '👥' },
                        { label: 'Revenue', value: '$45,231', icon: '💰' },
                        { label: 'Projects', value: '28', icon: '📁' },
                        { label: 'Tasks', value: '156', icon: '✓' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                </div>
                                <div className="text-4xl">{stat.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity</h2>
                        <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                            Chart Placeholder
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                        <ul className="space-y-4">
                            {['New user signup', 'Project created', 'Task completed', 'Report generated'].map((item, idx) => (
                                <li key={idx} className="flex items-center text-sm text-gray-700">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}