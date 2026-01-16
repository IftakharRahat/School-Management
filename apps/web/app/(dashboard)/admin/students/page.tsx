import { Suspense } from 'react';
import { Plus, Search, Download, Upload } from 'lucide-react';
import Link from 'next/link';
import { getStudents, getClasses, getFirstBranch } from './actions';
import StudentTable from './student-table';
import { auth } from '@/lib/auth';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        classId?: string;
        sectionId?: string;
    }>;
}

export default async function StudentsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const search = params.search || '';
    const classId = params.classId || '';
    const sectionId = params.sectionId || '';

    // Get branchId from session or fetch first branch
    const session = await auth();
    const branchId = session?.user?.branchId || await getFirstBranch();

    if (!branchId) {
        return <div className="p-6 text-center text-slate-500">No branch found. Please set up a branch first.</div>;
    }

    const [studentsData, classes] = await Promise.all([
        getStudents({ page, search, classId, sectionId, branchId }),
        getClasses(branchId),
    ]);

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Students</h1>
                    <p className="text-slate-500">Manage student records and enrollments</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/students/import"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <Upload size={18} />
                        Import
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                        <Download size={18} />
                        Export
                    </button>
                    <Link
                        href="/admin/students/new"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Add Student
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <form className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            placeholder="Search by name, admission no, or email..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                        />
                    </div>

                    {/* Class Filter */}
                    <select
                        name="classId"
                        defaultValue={classId}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-600 min-w-[150px]"
                    >
                        <option value="">All Classes</option>
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name}
                            </option>
                        ))}
                    </select>

                    {/* Section Filter - would be dynamic based on selected class */}
                    <select
                        name="sectionId"
                        defaultValue={sectionId}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-600 min-w-[150px]"
                    >
                        <option value="">All Sections</option>
                    </select>

                    <button
                        type="submit"
                        className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                        Filter
                    </button>
                </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <p className="text-sm text-slate-500">Total Students</p>
                    <p className="text-2xl font-bold text-slate-800">{studentsData.pagination.total}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <p className="text-sm text-slate-500">This Page</p>
                    <p className="text-2xl font-bold text-slate-800">{studentsData.students.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <p className="text-sm text-slate-500">Active</p>
                    <p className="text-2xl font-bold text-green-600">{studentsData.pagination.total}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <p className="text-sm text-slate-500">Inactive</p>
                    <p className="text-2xl font-bold text-slate-400">0</p>
                </div>
            </div>

            {/* Student Table */}
            <Suspense fallback={<div className="bg-white rounded-2xl p-8 text-center">Loading...</div>}>
                <StudentTable
                    students={studentsData.students.map(s => ({
                        ...s,
                        user: { ...s.user, createdAt: s.user.createdAt.toISOString(), updatedAt: s.user.updatedAt.toISOString() },
                        createdAt: s.createdAt.toISOString(),
                        updatedAt: s.updatedAt.toISOString(),
                        admissionDate: s.admissionDate.toISOString(),
                        dateOfBirth: s.dateOfBirth?.toISOString() || null,
                        enrollments: s.enrollments.map(e => ({
                            ...e,
                            createdAt: e.createdAt.toISOString(),
                            updatedAt: e.updatedAt.toISOString(),
                            section: {
                                ...e.section,
                                createdAt: e.section.createdAt.toISOString(),
                                updatedAt: e.section.updatedAt.toISOString(),
                                class: {
                                    ...e.section.class,
                                    createdAt: e.section.class.createdAt.toISOString(),
                                    updatedAt: e.section.class.updatedAt.toISOString(),
                                }
                            }
                        })),
                        guardians: s.guardians.map(sg => ({
                            ...sg,
                            guardian: {
                                ...sg.guardian,
                                createdAt: sg.guardian.createdAt.toISOString(),
                                updatedAt: sg.guardian.updatedAt.toISOString(),
                                user: {
                                    ...sg.guardian.user,
                                    createdAt: sg.guardian.user.createdAt.toISOString(),
                                    updatedAt: sg.guardian.user.updatedAt.toISOString(),
                                }
                            }
                        }))
                    })) as any} // Temporary cast as we fix types next
                    pagination={studentsData.pagination}
                />
            </Suspense>
        </div>
    );
}
