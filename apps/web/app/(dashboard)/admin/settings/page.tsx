'use client';

import { useState } from 'react';
import { Settings, CalendarRange, Building } from 'lucide-react';
import AcademicYears from './academic-years';
import BranchSettings from './branch-settings';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General Settings', icon: Building, component: <BranchSettings /> },
        { id: 'academic', label: 'Academic Years', icon: CalendarRange, component: <AcademicYears /> },
    ];

    return (
        <div className="p-6 max-w-[1400px] mx-auto h-[calc(100vh-80px)] overflow-y-auto">
            <div className="mb-8">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Admin</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Settings</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Settings className="text-slate-600" />
                    System Configuration
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl border p-2 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left ${activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9">
                    {tabs.find(t => t.id === activeTab)?.component}
                </div>
            </div>
        </div>
    );
}
