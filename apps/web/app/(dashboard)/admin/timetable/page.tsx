import { redirect } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getFirstBranch } from '../homework/actions';
import { getTimetableMasterData, getTimetable } from './actions';
import TimetableGrid from './timetable-grid';
import ClientSelector from './client-selector';

export default async function TimetablePage({
    searchParams,
}: {
    searchParams: Promise<{ classId?: string; sectionId?: string }>;
}) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const params = await searchParams;
    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const { classes, teachers, subjects } = await getTimetableMasterData(branchId);

    let timetable: any[] = [];
    if (params.sectionId) {
        timetable = await getTimetable(params.sectionId);
    }

    const activeClass = classes.find(c => c.id === params.classId);

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="text-blue-600" />
                    Class Timetable
                </h1>
                <p className="text-slate-500">Manage weekly schedules for classes</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <ClientSelector classes={classes} selectedClassId={params.classId} selectedSectionId={params.sectionId} />
            </div>

            {params.sectionId && activeClass ? (
                <TimetableGrid
                    classId={params.classId!}
                    sectionId={params.sectionId}
                    slots={timetable}
                    teachers={teachers}
                    subjects={subjects}
                />
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-slate-900 font-medium">Select a Class & Section</h3>
                    <p className="text-slate-500 text-sm">Choose a section above to view and edit its timetable</p>
                </div>
            )}
        </div>
    );
}
