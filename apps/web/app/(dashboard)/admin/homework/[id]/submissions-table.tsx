'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Clock, FileText } from 'lucide-react';
import { gradeSubmission } from '../actions';

interface Submission {
    id: string;
    content: string | null;
    attachmentUrl: string | null;
    submittedAt: Date;
    points: number | null;
    feedback: string | null;
    status: string;
    student: {
        id: string;
        admissionNo: string;
        user: { name: string };
    };
}

interface SubmissionsTableProps {
    submissions: Submission[];
    maxPoints: number;
    homeworkId: string;
}

export default function SubmissionsTable({ submissions, maxPoints, homeworkId }: SubmissionsTableProps) {
    const router = useRouter();
    const [grading, setGrading] = useState<string | null>(null);
    const [gradeData, setGradeData] = useState<{ points: number; feedback: string }>({ points: 0, feedback: '' });

    const handleGrade = async (submissionId: string) => {
        try {
            await gradeSubmission(submissionId, gradeData.points, gradeData.feedback, '');
            setGrading(null);
            router.refresh();
        } catch (error) {
            alert('Failed to grade submission');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUBMITTED':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Submitted</span>;
            case 'LATE':
                return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">Late</span>;
            case 'GRADED':
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Graded</span>;
            case 'RETURNED':
                return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Returned</span>;
            default:
                return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{status}</span>;
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (submissions.length === 0) {
        return (
            <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Submissions Yet</h3>
                <p className="text-slate-500">Students haven't submitted their work yet</p>
            </div>
        );
    }

    return (
        <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Points</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody>
                {submissions.map((submission) => (
                    <tr key={submission.id} className="border-b border-slate-50">
                        <td className="px-6 py-4">
                            <p className="font-medium text-slate-800">{submission.student.user.name}</p>
                            <p className="text-sm text-slate-500">{submission.student.admissionNo}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatDate(submission.submittedAt)}
                            </span>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(submission.status)}</td>
                        <td className="px-6 py-4">
                            {submission.points !== null ? (
                                <span className="font-medium text-slate-800">
                                    {submission.points} / {maxPoints}
                                </span>
                            ) : (
                                <span className="text-slate-400">—</span>
                            )}
                        </td>
                        <td className="px-6 py-4">
                            {grading === submission.id ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={gradeData.points}
                                        onChange={(e) => setGradeData({ ...gradeData, points: Number(e.target.value) })}
                                        min={0}
                                        max={maxPoints}
                                        className="w-16 px-2 py-1 border border-slate-200 rounded text-sm"
                                        placeholder="Pts"
                                    />
                                    <input
                                        type="text"
                                        value={gradeData.feedback}
                                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                        className="w-32 px-2 py-1 border border-slate-200 rounded text-sm"
                                        placeholder="Feedback"
                                    />
                                    <button
                                        onClick={() => handleGrade(submission.id)}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => setGrading(null)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => {
                                            setGrading(submission.id);
                                            setGradeData({
                                                points: submission.points || 0,
                                                feedback: submission.feedback || ''
                                            });
                                        }}
                                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Grade
                                    </button>
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
