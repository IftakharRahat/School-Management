'use client';

import { useState, useEffect } from 'react';
import { getBranchDetails, updateBranchDetails } from './actions';
import { Save, Building2, MapPin, Phone, Mail } from 'lucide-react';

export default function BranchSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [branch, setBranch] = useState<any>(null);

    // Form
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const data = await getBranchDetails();
            if (data) {
                setBranch(data);
                setFormData({
                    name: data.name || '',
                    address: data.address || '',
                    phone: data.phone || '',
                    email: data.email || ''
                });
            }
        } catch (error) {
            console.error("Failed", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await updateBranchDetails(formData);
            if (res.success) {
                alert('Settings saved successfully!');
            } else {
                alert('Failed to save settings');
            }
        } catch (error) {
            alert('Error saving settings');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="text-slate-500">Loading settings...</div>;

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">General Settings</h2>
                <p className="text-sm text-slate-500">Update your school branch details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 bg-white p-6 border rounded-xl">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                            <Building2 size={16} /> School/Branch Name
                        </label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                            <MapPin size={16} /> Address
                        </label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <Phone size={16} /> Phone
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <Mail size={16} /> Email
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm shadow-blue-200"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
