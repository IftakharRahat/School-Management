import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getSubjects, getFirstBranch, getClassesForSubject } from './actions';
import SubjectTable from './subject-table';

export default async function SubjectsPage({
    searchParams,
}: {
    searchParams: { search?: string; classId?: string }
}) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const [subjects, classes] = await Promise.all([
        getSubjects({
            branchId,
            classId: searchParams.classId,
            search: searchParams.search,
        }),
        getClassesForSubject(branchId),
    ]);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
                    <p className="text-slate-500">Manage subjects for each class</p>
                </div>
                <Link
                    href="/admin/subjects/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add Subject
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                <form className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                name="search"
                                placeholder="Search subjects..."
                                defaultValue={searchParams.search}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <select
                        name="classId"
                        defaultValue={searchParams.classId}
                        className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Classes</option>
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                    >
                        Filter
                    </button>
                </form>
            </div>

            {/* Table */}
            <Suspense fallback={<div>Loading...</div>}>
                <SubjectTable subjects={subjects} />
            </Suspense>
        </div>
    );
}
