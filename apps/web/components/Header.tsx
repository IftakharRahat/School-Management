'use client';

import React from 'react';
import { Search, MessageCircle, Bell } from 'lucide-react';

export default function Header() {
    return (
        <header className="h-16 flex items-center justify-between px-6 bg-transparent">
            <div className="flex-1 max-w-md relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search..."
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                    <button className="text-slate-500 hover:text-slate-700 relative">
                        <MessageCircle size={20} />
                    </button>
                    <button className="text-slate-500 hover:text-slate-700 relative">
                        <Bell size={20} />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">1</span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-semibold text-slate-900 leading-none">Adam Holland</div>
                        <div className="text-xs text-slate-500 mt-1 uppercase">admin</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                        A
                    </div>
                </div>
            </div>
        </header>
    );
}
