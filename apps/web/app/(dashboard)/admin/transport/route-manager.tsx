'use client';

import { useState } from 'react';
import { Plus, Trash2, MapPin, X, Loader2 } from 'lucide-react';
import { createRoute, deleteRoute } from './actions';

type Route = {
    id: string;
    name: string;
    startPoint: string;
    endPoint: string;
    stops: string | null;
    fare: number | null;
    _count: { students: number };
    vehicle: { registrationNo: string } | null;
};

export default function RouteManager({ routes }: { routes: Route[] }) {
    const [showAdd, setShowAdd] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: '',
        startPoint: '',
        endPoint: '',
        stops: '',
        fare: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await createRoute({
            name: form.name,
            startPoint: form.startPoint,
            endPoint: form.endPoint,
            stops: form.stops || undefined,
            fare: form.fare ? parseFloat(form.fare) : undefined,
        });
        setForm({ name: '', startPoint: '', endPoint: '', stops: '', fare: '' });
        setShowAdd(false);
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this route?')) {
            await deleteRoute(id);
        }
    };

    return (
        <div className="space-y-4">
            <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
            >
                <Plus size={16} /> Add Route
            </button>

            {showAdd && (
                <div className="p-4 bg-slate-50 rounded-lg border">
                    <div className="flex justify-between mb-3">
                        <span className="font-medium">New Route</span>
                        <button onClick={() => setShowAdd(false)}><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-2">
                        <input type="text" placeholder="Route Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" required />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Start Point *" value={form.startPoint} onChange={(e) => setForm({ ...form, startPoint: e.target.value })} className="border rounded px-3 py-2 text-sm" required />
                            <input type="text" placeholder="End Point *" value={form.endPoint} onChange={(e) => setForm({ ...form, endPoint: e.target.value })} className="border rounded px-3 py-2 text-sm" required />
                        </div>
                        <input type="text" placeholder="Stops (comma separated)" value={form.stops} onChange={(e) => setForm({ ...form, stops: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                        <input type="number" placeholder="Monthly Fare" value={form.fare} onChange={(e) => setForm({ ...form, fare: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded text-sm">
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Add Route'}
                        </button>
                    </form>
                </div>
            )}

            {routes.length === 0 ? (
                <p className="text-slate-500 text-sm">No routes created yet.</p>
            ) : (
                <div className="space-y-2">
                    {routes.map(route => (
                        <div key={route.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                                <div className="font-medium text-slate-800">{route.name}</div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <MapPin size={12} />
                                    {route.startPoint} → {route.endPoint}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    {route._count.students} students
                                    {route.fare && ` • ৳${route.fare}/mo`}
                                    {route.vehicle && ` • ${route.vehicle.registrationNo}`}
                                </div>
                            </div>
                            <button onClick={() => handleDelete(route.id)} className="p-1 text-slate-400 hover:text-red-600">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
