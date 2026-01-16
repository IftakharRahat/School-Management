'use client';

import { useState } from 'react';
import { RotateCcw, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { returnBook, issueBook } from './actions';

type Issue = {
    id: string;
    issueDate: Date;
    dueDate: Date;
    status: string;
    book: { title: string; author: string };
    student: { admissionNo: string; user: { name: string } };
};

type Book = { id: string; title: string; available: number };
type Student = { id: string; admissionNo: string; user: { name: string } };

export default function IssueManager({
    issues,
    books,
    students,
}: {
    issues: Issue[];
    books: Book[];
    students: Student[];
}) {
    const [showIssue, setShowIssue] = useState(false);
    const [selectedBook, setSelectedBook] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleIssue = async () => {
        if (!selectedBook || !selectedStudent) return;
        setIsSubmitting(true);
        await issueBook(selectedBook, selectedStudent);
        setSelectedBook('');
        setSelectedStudent('');
        setShowIssue(false);
        setIsSubmitting(false);
    };

    const handleReturn = async (issueId: string) => {
        if (confirm('Mark this book as returned?')) {
            await returnBook(issueId);
        }
    };

    const isOverdue = (dueDate: Date) => new Date(dueDate) < new Date();

    return (
        <div className="space-y-6">
            {/* Issue Button */}
            <button
                onClick={() => setShowIssue(!showIssue)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
                <Clock size={18} /> Issue Book
            </button>

            {/* Issue Form */}
            {showIssue && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 max-w-md">
                    <h3 className="font-semibold mb-3">Issue Book to Student</h3>
                    <div className="space-y-3">
                        <select
                            value={selectedBook}
                            onChange={(e) => setSelectedBook(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="">Select Book</option>
                            {books.filter(b => b.available > 0).map(book => (
                                <option key={book.id} value={book.id}>
                                    {book.title} ({book.available} available)
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="">Select Student</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.user.name} ({s.admissionNo})
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleIssue}
                            disabled={!selectedBook || !selectedStudent || isSubmitting}
                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Issue Book'}
                        </button>
                    </div>
                </div>
            )}

            {/* Active Issues */}
            <div>
                <h3 className="font-semibold text-slate-800 mb-3">Active Issues ({issues.length})</h3>
                {issues.length === 0 ? (
                    <p className="text-slate-500 text-sm">No books currently issued.</p>
                ) : (
                    <div className="space-y-2">
                        {issues.map(issue => {
                            const overdue = isOverdue(issue.dueDate);
                            return (
                                <div
                                    key={issue.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border ${overdue ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
                                        }`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {overdue && <AlertTriangle className="text-red-500" size={16} />}
                                            <span className="font-medium">{issue.book.title}</span>
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            Issued to: {issue.student.user.name} ({issue.student.admissionNo})
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            Due: {new Date(issue.dueDate).toLocaleDateString()}
                                            {overdue && <span className="text-red-500 ml-2">OVERDUE</span>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleReturn(issue.id)}
                                        className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200"
                                    >
                                        <RotateCcw size={14} /> Return
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
