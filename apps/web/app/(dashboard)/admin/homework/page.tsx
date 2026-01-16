import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getHomeworks, getFirstBranch, getClassesForHomework } from './actions';
import HomeworkTable from './homework-table';

export default async function HomeworkPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; classId?: string; status?: string }>;
}) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const params = await searchParams;
    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const page = Number(params.page) || 1;
    const classId = params.classId;
    const status = params.status as any;

    const [homeworkData, classes] = await Promise.all([
        getHomeworks({
            branchId,
            classId,
            status,
            page,
            limit: 10,
        }),
        getClassesForHomework(branchId),
    ]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Homework & Assignments</h1>
                    <p className="text-slate-500">Manage homework for classes</p>
                </div>
                <Link
                    href="/admin/homework/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    Create Homework
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                <form className="flex items-center gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                        <select
                            name="classId"
                            defaultValue={classId || ''}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        >
                            <option value="">All Classes</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                            name="status"
                            defaultValue={status || ''}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="DRAFT">Draft</option>
                            <option value="CLOSED">Closed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <div className="pt-5">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                        >
                            Filter
                        </button>
                    </div>
                </form>
            </div>

            <HomeworkTable
                homeworks={homeworkData.homeworks}
                pagination={homeworkData.pagination}
            />
        </div>
    );
}
