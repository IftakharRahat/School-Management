import { redirect } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getFirstBranch } from '../homework/actions'; // Reuse existing
import { getTimetableMasterData, getTimetable } from './actions';
import TimetableGrid from './timetable-grid';

export default async function TimetablePage({
    searchParams,
}: {
    searchParams: { classId?: string; sectionId?: string };
}) {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const branchId = session.user.branchId || await getFirstBranch();
    if (!branchId) return <div>No branch found</div>;

    const { classes, teachers, subjects } = await getTimetableMasterData(branchId);

    let timetable: any[] = [];
    if (searchParams.sectionId) {
        timetable = await getTimetable(searchParams.sectionId);
    }

    // Helper to preserve selection state in UI
    // We pass data to a Client Component which handles interactions
    // But since we want URL state, we render the grid directly if data exists

    const activeClass = classes.find(c => c.id === searchParams.classId);

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="text-blue-600" />
                    Class Timetable
                </h1>
                <p className="text-slate-500">Manage weekly schedules for classes</p>
            </div>

            {/* Selection Area - Using simple form or links for server-side simplicity? 
                Actually, let's use a Client Component for the dropdowns that pushes URL */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <form className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
                        <select
                            name="classId"
                            defaultValue={searchParams.classId}
                            className="w-48 p-2.5 border border-slate-200 rounded-lg text-sm"
                        // Simple onchange submit via JS or just rely on user hitting a button? 
                        // For best UX in Server Components, client nav is better. 
                        // But for rapid dev, let's embed a quick script or Client Component.
                        >
                            {/* This is just static HTML, we need the Client Component for interactivity */}
                        </select>
                    </div>
                </form>
                {/* Replacing above form with the Client Component */}
                <ClientSelector classes={classes} selectedClassId={searchParams.classId} selectedSectionId={searchParams.sectionId} />
            </div>

            {searchParams.sectionId && activeClass ? (
                <TimetableGrid
                    classId={searchParams.classId!}
                    sectionId={searchParams.sectionId}
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

// Optimization: Inline Client Component for the selector to avoid file sprawl if it's small
import ClientSelector from './client-selector';
