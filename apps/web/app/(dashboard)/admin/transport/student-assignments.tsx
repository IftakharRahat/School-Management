'use client';

import { useState } from 'react';
import { Plus, X, Loader2, UserMinus } from 'lucide-react';
import { assignStudentToRoute, removeStudentFromRoute } from './actions';

type Assignment = {
    id: string;
    pickupPoint: string;
    student: { admissionNo: string; user: { name: string } };
    route: { name: string; fare: number | null };
};
type Route = { id: string; name: string };
type Student = { id: string; admissionNo: string; user: { name: string } };

export default function StudentAssignments({
    assignments,
    routes,
    students,
}: {
    assignments: Assignment[];
    routes: Route[];
    students: Student[];
}) {
    const [showAdd, setShowAdd] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ studentId: '', routeId: '', pickupPoint: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.studentId || !form.routeId || !form.pickupPoint) return;
        setIsSubmitting(true);
        await assignStudentToRoute(form.studentId, form.routeId, form.pickupPoint);
        setForm({ studentId: '', routeId: '', pickupPoint: '' });
        setShowAdd(false);
        setIsSubmitting(false);
    };

    const handleRemove = async (id: string) => {
        if (confirm('Remove this student from route?')) {
            await removeStudentFromRoute(id);
        }
    };

    return (
        <div className="space-y-4">
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-sm bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700">
                <Plus size={16} /> Assign Student
            </button>

            {showAdd && (
                <div className="p-4 bg-slate-50 rounded-lg border max-w-md">
                    <div className="flex justify-between mb-3">
                        <span className="font-medium">Assign Student to Route</span>
                        <button onClick={() => setShowAdd(false)}><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" required>
                            <option value="">Select Student</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.user.name} ({s.admissionNo})</option>)}
                        </select>
                        <select value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" required>
                            <option value="">Select Route</option>
                            {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <input type="text" placeholder="Pickup Point *" value={form.pickupPoint} onChange={(e) => setForm({ ...form, pickupPoint: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" required />
                        <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 text-white py-2 rounded text-sm">
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Assign'}
                        </button>
                    </form>
                </div>
            )}

            {assignments.length === 0 ? (
                <p className="text-slate-500 text-sm">No students assigned to transport yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-4 py-2">Student</th>
                                <th className="text-left px-4 py-2">Route</th>
                                <th className="text-left px-4 py-2">Pickup Point</th>
                                <th className="text-center px-4 py-2">Fare</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {assignments.map(a => (
                                <tr key={a.id}>
                                    <td className="px-4 py-2">
                                        <div className="font-medium">{a.student.user.name}</div>
                                        <div className="text-xs text-slate-400">{a.student.admissionNo}</div>
                                    </td>
                                    <td className="px-4 py-2 text-blue-600">{a.route.name}</td>
                                    <td className="px-4 py-2 text-slate-600">{a.pickupPoint}</td>
                                    <td className="px-4 py-2 text-center">{a.route.fare ? `৳${a.route.fare}` : '-'}</td>
                                    <td className="px-4 py-2 text-center">
                                        <button onClick={() => handleRemove(a.id)} className="p-1 text-slate-400 hover:text-red-600" title="Remove">
                                            <UserMinus size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
