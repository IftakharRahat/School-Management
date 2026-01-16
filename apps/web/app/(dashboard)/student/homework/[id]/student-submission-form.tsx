'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { submitHomework } from '../../../admin/homework/actions';

interface StudentSubmissionFormProps {
    homeworkId: string;
    studentId: string;
    initialData?: {
        content: string | null;
        attachmentUrl: string | null;
    } | null;
    isLate: boolean;
    status: string;
}

export default function StudentSubmissionForm({
    homeworkId,
    studentId,
    initialData,
    isLate,
    status
}: StudentSubmissionFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState(initialData?.content || '');
    const [attachmentUrl, setAttachmentUrl] = useState(initialData?.attachmentUrl || '');

    const isGraded = status === 'GRADED';
    const isSubmitted = status === 'SUBMITTED' || status === 'LATE' || status === 'GRADED';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await submitHomework(homeworkId, studentId, content, attachmentUrl);
            router.refresh();
            alert('Homework submitted successfully!');
        } catch (error) {
            alert('Failed to submit homework');
        } finally {
            setLoading(false);
        }
    };

    if (isGraded) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">Graded</h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-green-800 mb-1">Your Submission</h4>
                        <p className="text-green-900 whitespace-pre-wrap">{content}</p>
                        {attachmentUrl && (
                            <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-green-700 underline text-sm block mt-1">
                                View Attachment
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {isSubmitted ? 'Edit Submission' : 'Your Submission'}
            </h3>

            {isLate && !isSubmitted && (
                <div className="mb-4 text-amber-600 text-sm bg-amber-50 px-3 py-2 rounded-lg">
                    This assignment is past due. Your submission will be marked as Late.
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Answer / Content
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type your answer here..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Attachment Link (Google Drive / Dropbox)
                    </label>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                            type="url"
                            value={attachmentUrl}
                            onChange={(e) => setAttachmentUrl(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : isSubmitted ? 'Update Submission' : 'Submit Assignment'}
                    </button>
                    {isSubmitted && (
                        <p className="text-center text-sm text-slate-500 mt-2">
                            You can edit your submission until grading.
                        </p>
                    )}
                </div>
            </div>
        </form>
    );
}
