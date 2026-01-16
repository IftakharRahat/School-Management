import { redirect } from 'next/navigation';
import { Bus, Route, Users, Plus } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getRoutes, getVehicles, getStudentTransportAssignments, getStudentsForTransport } from './actions';
import RouteManager from './route-manager';
import VehicleManager from './vehicle-manager';
import StudentAssignments from './student-assignments';

export default async function TransportPage() {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const [routes, vehicles, assignments, students] = await Promise.all([
        getRoutes(),
        getVehicles(),
        getStudentTransportAssignments(),
        getStudentsForTransport(),
    ]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Admin</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Transport</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Bus className="text-blue-600" />
                    Transport Management
                </h1>
                <p className="text-slate-500 mt-1">Manage routes, vehicles, and student transport assignments.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <Route className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{routes.length}</p>
                        <p className="text-sm text-slate-500">Active Routes</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border p-4 flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                        <Bus className="text-green-600" size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{vehicles.length}</p>
                        <p className="text-sm text-slate-500">Vehicles</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border p-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                        <Users className="text-purple-600" size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{assignments.length}</p>
                        <p className="text-sm text-slate-500">Students Assigned</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Routes */}
                <div className="bg-white rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Route size={20} className="text-blue-600" />
                        Routes
                    </h2>
                    <RouteManager routes={routes as any} />
                </div>

                {/* Vehicles */}
                <div className="bg-white rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Bus size={20} className="text-green-600" />
                        Vehicles
                    </h2>
                    <VehicleManager vehicles={vehicles as any} routes={routes as any} />
                </div>
            </div>

            {/* Student Assignments */}
            <div className="mt-6 bg-white rounded-xl border p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users size={20} className="text-purple-600" />
                    Student Assignments
                </h2>
                <StudentAssignments
                    assignments={assignments as any}
                    routes={routes as any}
                    students={students as any}
                />
            </div>
        </div>
    );
}
