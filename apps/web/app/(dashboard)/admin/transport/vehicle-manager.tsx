'use client';

import { useState } from 'react';
import { Plus, Trash2, X, Loader2, Bus } from 'lucide-react';
import { createVehicle, deleteVehicle } from './actions';

type Vehicle = { id: string; registrationNo: string; type: string; capacity: number; driverName: string; driverPhone: string; route: { name: string } | null };
type Route = { id: string; name: string };

export default function VehicleManager({ vehicles, routes }: { vehicles: Vehicle[]; routes: Route[] }) {
    const [showAdd, setShowAdd] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        registrationNo: '',
        type: 'BUS',
        capacity: '40',
        driverName: '',
        driverPhone: '',
        routeId: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await createVehicle({
            registrationNo: form.registrationNo,
            type: form.type as any,
            capacity: parseInt(form.capacity) || 40,
            driverName: form.driverName,
            driverPhone: form.driverPhone,
            routeId: form.routeId || undefined,
        });
        setForm({ registrationNo: '', type: 'BUS', capacity: '40', driverName: '', driverPhone: '', routeId: '' });
        setShowAdd(false);
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this vehicle?')) {
            await deleteVehicle(id);
        }
    };

    return (
        <div className="space-y-4">
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                <Plus size={16} /> Add Vehicle
            </button>

            {showAdd && (
                <div className="p-4 bg-slate-50 rounded-lg border">
                    <div className="flex justify-between mb-3">
                        <span className="font-medium">New Vehicle</span>
                        <button onClick={() => setShowAdd(false)}><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-2">
                        <input type="text" placeholder="Registration No *" value={form.registrationNo} onChange={(e) => setForm({ ...form, registrationNo: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" required />
                        <div className="grid grid-cols-2 gap-2">
                            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border rounded px-3 py-2 text-sm">
                                <option value="BUS">Bus</option>
                                <option value="MINIBUS">Minibus</option>
                                <option value="VAN">Van</option>
                                <option value="MICROBUS">Microbus</option>
                            </select>
                            <input type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="border rounded px-3 py-2 text-sm" />
                        </div>
                        <input type="text" placeholder="Driver Name *" value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" required />
                        <input type="text" placeholder="Driver Phone *" value={form.driverPhone} onChange={(e) => setForm({ ...form, driverPhone: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" required />
                        <select value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                            <option value="">Assign to Route (Optional)</option>
                            {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white py-2 rounded text-sm">
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Add Vehicle'}
                        </button>
                    </form>
                </div>
            )}

            {vehicles.length === 0 ? (
                <p className="text-slate-500 text-sm">No vehicles added yet.</p>
            ) : (
                <div className="space-y-2">
                    {vehicles.map(v => (
                        <div key={v.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Bus className="text-green-600" size={20} />
                                <div>
                                    <div className="font-medium text-slate-800">{v.registrationNo}</div>
                                    <div className="text-xs text-slate-500">
                                        {v.type} • {v.capacity} seats • {v.driverName}
                                    </div>
                                    {v.route && <div className="text-xs text-blue-600">Route: {v.route.name}</div>}
                                </div>
                            </div>
                            <button onClick={() => handleDelete(v.id)} className="p-1 text-slate-400 hover:text-red-600">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
