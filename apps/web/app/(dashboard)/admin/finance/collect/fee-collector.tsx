'use client';

import { useState } from 'react';
import { Search, User, DollarSign, Calendar, CheckCircle, Clock, X, CreditCard, Loader2 } from 'lucide-react';
import { searchStudents, getStudentPendingFees, collectPayment, generateStudentFees } from './actions';

type SearchStudent = {
    id: string;
    rollNo: string | null;
    admissionNo: string;
    user: { name: string | null };
    enrollments: Array<{
        section: {
            name: string;
            class: { name: string } | null;
        } | null;
    }>;
};

type SelectedStudent = {
    id: string;
    rollNo: string | null;
    admissionNo: string;
    user: { name: string | null };
    enrollments: Array<{
        section: {
            name: string;
            class: { name: string } | null;
        } | null;
    }>;
    feePayments?: any[];
};

export default function FeeCollector() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchStudent[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<SelectedStudent | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingFees, setIsLoadingFees] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [payingId, setPayingId] = useState<string | null>(null);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const results = await searchStudents(query);
        setSearchResults(results as any);
        setIsSearching(false);
    };

    const selectStudent = async (student: SearchStudent) => {
        setSearchQuery('');
        setSearchResults([]);
        setIsLoadingFees(true);
        const fullStudent = await getStudentPendingFees(student.id);
        setSelectedStudent(fullStudent as any);
        setIsLoadingFees(false);
    };

    const handleGenerateFees = async () => {
        if (!selectedStudent) return;
        setIsGenerating(true);
        const now = new Date();
        const result = await generateStudentFees(selectedStudent.id, now.getMonth() + 1, now.getFullYear());
        if (result?.error) {
            alert(result.error);
        } else {
            alert(`Generated ${result.created} fee(s) for this month.`);
            // Refresh student data
            const updated = await getStudentPendingFees(selectedStudent.id);
            setSelectedStudent(updated as any);
        }
        setIsGenerating(false);
    };

    const handleCollect = async (paymentId: string) => {
        const method = prompt('Enter payment method (CASH, BKASH, NAGAD, BANK_TRANSFER, CARD):');
        if (!method) return;

        setPayingId(paymentId);
        const result = await collectPayment(paymentId, method.toUpperCase());
        if (result?.error) {
            alert(result.error);
        } else {
            // Refresh
            const updated = await getStudentPendingFees(selectedStudent!.id);
            setSelectedStudent(updated as any);
        }
        setPayingId(null);
    };

    const pendingFees = selectedStudent?.feePayments?.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE') || [];
    const paidFees = selectedStudent?.feePayments?.filter(p => p.status === 'PAID') || [];

    const getStudentName = (s: SearchStudent | SelectedStudent | null) => s?.user?.name || 'Unknown';
    const getClassName = (s: SearchStudent | SelectedStudent | null) => s?.enrollments?.[0]?.section?.class?.name || '';
    const getSectionName = (s: SearchStudent | SelectedStudent | null) => s?.enrollments?.[0]?.section?.name || '';

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-slate-400" size={20} />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search student by name, roll number, or admission no..."
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                />
                {isSearching && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <Loader2 className="animate-spin text-blue-500" size={20} />
                    </div>
                )}

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-lg border border-slate-200 max-h-80 overflow-y-auto">
                        {searchResults.map((student) => (
                            <button
                                key={student.id}
                                onClick={() => selectStudent(student)}
                                className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 last:border-0"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <div className="font-medium text-slate-800">{getStudentName(student)}</div>
                                    <div className="text-sm text-slate-500">
                                        {getClassName(student)} {getSectionName(student) && `- ${getSectionName(student)}`}
                                        {student.rollNo && ` | Roll: ${student.rollNo}`}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Student */}
            {selectedStudent && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                    <User size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{getStudentName(selectedStudent)}</h2>
                                    <p className="text-blue-100">
                                        {getClassName(selectedStudent)} {getSectionName(selectedStudent) && `- ${getSectionName(selectedStudent)}`}
                                        {selectedStudent.rollNo && ` | Roll: ${selectedStudent.rollNo}`}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="text-white/70 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                            <span className="font-medium">{pendingFees.length}</span> pending fee(s)
                        </div>
                        <button
                            onClick={handleGenerateFees}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                        >
                            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Calendar size={16} />}
                            Generate This Month's Fees
                        </button>
                    </div>

                    {/* Pending Fees */}
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Clock className="text-orange-500" size={20} />
                            Pending Payments
                        </h3>
                        {pendingFees.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">No pending fees.</div>
                        ) : (
                            <div className="space-y-3">
                                {pendingFees.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                                    >
                                        <div>
                                            <div className="font-medium text-slate-800">{payment.feeHead.name}</div>
                                            <div className="text-sm text-slate-500">
                                                Due: {new Date(payment.dueDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-xl font-bold text-slate-800">৳{payment.amount}</div>
                                            <button
                                                onClick={() => handleCollect(payment.id)}
                                                disabled={payingId === payment.id}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                                            >
                                                {payingId === payment.id ? (
                                                    <Loader2 className="animate-spin" size={16} />
                                                ) : (
                                                    <CreditCard size={16} />
                                                )}
                                                Collect
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Paid Fees */}
                    {paidFees.length > 0 && (
                        <div className="p-6 border-t border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <CheckCircle className="text-green-500" size={20} />
                                Payment History
                            </h3>
                            <div className="space-y-2">
                                {paidFees.slice(0, 5).map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100"
                                    >
                                        <div>
                                            <div className="font-medium text-slate-800">{payment.feeHead.name}</div>
                                            <div className="text-sm text-slate-500">
                                                Paid: {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : '-'}
                                                {payment.method && ` via ${payment.method}`}
                                            </div>
                                        </div>
                                        <div className="text-lg font-semibold text-green-600">৳{payment.amount}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Initial State */}
            {!selectedStudent && !isLoadingFees && (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <DollarSign className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500">Search for a student to collect fees</p>
                </div>
            )}

            {isLoadingFees && (
                <div className="text-center py-16">
                    <Loader2 className="mx-auto animate-spin text-blue-500 mb-4" size={48} />
                    <p className="text-slate-500">Loading student data...</p>
                </div>
            )}
        </div>
    );
}
