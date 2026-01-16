import { redirect } from 'next/navigation';
import { Library, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/database';
import { format, differenceInDays } from 'date-fns';

export default async function StudentLibraryPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const student = await prisma.student.findFirst({
        where: { userId: session.user.id }
    });

    if (!student) redirect('/login');

    // Get student's borrowed books
    const borrowedBooks = await prisma.bookIssue.findMany({
        where: {
            studentId: student.id,
            returnDate: null // Not yet returned
        },
        include: {
            book: true
        },
        orderBy: { issueDate: 'desc' }
    });

    // Get reading history (returned books)
    const history = await prisma.bookIssue.findMany({
        where: {
            studentId: student.id,
            returnDate: { not: null }
        },
        include: {
            book: true
        },
        orderBy: { returnDate: 'desc' },
        take: 10
    });

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Student</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Library</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Library className="text-blue-600" />
                    My Library
                </h1>
                <p className="text-slate-500 mt-1">Your borrowed books and reading history</p>
            </div>

            {/* Currently Borrowed */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-green-600" />
                    Currently Borrowed ({borrowedBooks.length})
                </h2>

                {borrowedBooks.length === 0 ? (
                    <div className="bg-slate-50 border rounded-xl p-6 text-center">
                        <p className="text-slate-500">You haven't borrowed any books.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {borrowedBooks.map(issue => {
                            const daysLeft = differenceInDays(new Date(issue.dueDate), new Date());
                            const isOverdue = daysLeft < 0;

                            return (
                                <div key={issue.id} className="bg-white border rounded-xl p-4 flex gap-4">
                                    <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                        {issue.book.title.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-800">{issue.book.title}</h3>
                                        <p className="text-sm text-slate-500 mb-2">{issue.book.author}</p>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span className="text-slate-500">
                                                Due: {format(new Date(issue.dueDate), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                        {isOverdue && (
                                            <div className="mt-2 flex items-center gap-1 text-red-600 text-sm">
                                                <AlertCircle size={14} />
                                                Overdue by {Math.abs(daysLeft)} day(s)
                                            </div>
                                        )}
                                        {!isOverdue && daysLeft <= 3 && (
                                            <div className="mt-2 flex items-center gap-1 text-amber-600 text-sm">
                                                <AlertCircle size={14} />
                                                Due in {daysLeft} day(s)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Reading History */}
            <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">📚 Reading History</h2>

                {history.length === 0 ? (
                    <div className="bg-slate-50 border rounded-xl p-6 text-center">
                        <p className="text-slate-500">No reading history yet.</p>
                    </div>
                ) : (
                    <div className="bg-white border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-slate-500">Book</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-500">Author</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-500">Borrowed</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-500">Returned</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {history.map(issue => (
                                    <tr key={issue.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-800">{issue.book.title}</td>
                                        <td className="px-4 py-3 text-slate-500">{issue.book.author}</td>
                                        <td className="px-4 py-3 text-slate-500">{format(new Date(issue.issueDate), 'MMM d, yyyy')}</td>
                                        <td className="px-4 py-3 text-slate-500">{issue.returnDate ? format(new Date(issue.returnDate), 'MMM d, yyyy') : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
