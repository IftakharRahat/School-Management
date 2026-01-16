'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download, X } from 'lucide-react';
import { bulkImportStudents } from './actions';

interface ClassWithSections {
    id: string;
    name: string;
    grade: number;
    sections: { id: string; name: string }[];
}

interface ImportFormProps {
    branchId: string;
    tenantId: string;
    classes: ClassWithSections[];
}

interface ParsedStudent {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    bloodGroup?: string;
    address: string;
    admissionNo: string;
    admissionDate?: string;
    classId: string;
    sectionId: string;
}

export default function ImportForm({ branchId, tenantId, classes }: ImportFormProps) {
    const router = useRouter();
    const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [result, setResult] = useState<{
        imported: number;
        failed: number;
        errors: { row: number; message: string }[];
    } | null>(null);

    const selectedClass = classes.find(c => c.id === selectedClassId);

    const parseCSV = (content: string): ParsedStudent[] => {
        const lines = content.trim().split('\n');
        if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const students: ParsedStudent[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length < headers.length) continue;

            const row: any = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });

            // Map CSV columns to our format
            const gender = (row.gender || '').toUpperCase();
            students.push({
                firstName: row.firstname || row['first name'] || row.first_name || '',
                lastName: row.lastname || row['last name'] || row.last_name || '',
                email: row.email || '',
                phone: row.phone || row.mobile || '',
                dateOfBirth: row.dateofbirth || row['date of birth'] || row.dob || row.date_of_birth || '',
                gender: ['MALE', 'FEMALE', 'OTHER'].includes(gender) ? gender : 'OTHER',
                bloodGroup: row.bloodgroup || row['blood group'] || row.blood_group || '',
                address: row.address || '',
                admissionNo: row.admissionno || row['admission no'] || row.admission_no || row.admissionnumber || '',
                admissionDate: row.admissiondate || row['admission date'] || row.admission_date || '',
                classId: selectedClassId,
                sectionId: selectedSectionId,
            });
        }

        return students;
    };

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!selectedClassId || !selectedSectionId) {
            setError('Please select a class and section first');
            return;
        }

        setLoading(true);
        setError(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const students = parseCSV(content);

                if (students.length === 0) {
                    throw new Error('No valid student data found in the file');
                }

                setParsedData(students);
                setStep('preview');
            } catch (err: any) {
                setError(err.message || 'Failed to parse CSV file');
            } finally {
                setLoading(false);
            }
        };
        reader.onerror = () => {
            setError('Failed to read file');
            setLoading(false);
        };
        reader.readAsText(file);
    }, [selectedClassId, selectedSectionId]);

    const handleImport = async () => {
        setLoading(true);
        setError(null);

        try {
            const importResult = await bulkImportStudents(parsedData, branchId, tenantId);
            setResult(importResult);
            setStep('result');
        } catch (err: any) {
            setError(err.message || 'Import failed');
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = ['FirstName', 'LastName', 'Email', 'Phone', 'DateOfBirth', 'Gender', 'BloodGroup', 'Address', 'AdmissionNo', 'AdmissionDate'];
        const sampleRow = ['John', 'Doe', 'john@example.com', '01700000000', '2010-01-15', 'MALE', 'A+', '123 Main St', 'STU001', '2024-01-01'];
        const csv = [headers.join(','), sampleRow.join(',')].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_import_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {step === 'upload' && (
                <div className="space-y-6">
                    {/* Class & Section Selection */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">1. Select Class & Section</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Class *</label>
                                <select
                                    value={selectedClassId}
                                    onChange={(e) => {
                                        setSelectedClassId(e.target.value);
                                        setSelectedSectionId('');
                                    }}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Section *</label>
                                <select
                                    value={selectedSectionId}
                                    onChange={(e) => setSelectedSectionId(e.target.value)}
                                    disabled={!selectedClassId}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                                >
                                    <option value="">Select Section</option>
                                    {selectedClass?.sections.map((section) => (
                                        <option key={section.id} value={section.id}>{section.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Upload Area */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">2. Upload CSV File</h2>

                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                            <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                            <p className="text-slate-600 mb-4">
                                Drag and drop your CSV file here, or click to browse
                            </p>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                disabled={!selectedClassId || !selectedSectionId || loading}
                                className="hidden"
                                id="csv-upload"
                            />
                            <label
                                htmlFor="csv-upload"
                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors ${selectedClassId && selectedSectionId
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                <Upload className="w-5 h-5" />
                                {loading ? 'Processing...' : 'Choose File'}
                            </label>
                        </div>

                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={downloadTemplate}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <Download className="w-4 h-4" />
                                Download CSV Template
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 'preview' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900">Preview Import Data</h2>
                            <span className="text-sm text-slate-500">{parsedData.length} students found</span>
                        </div>

                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-slate-600">#</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-600">Name</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-600">Admission No</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-600">Gender</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-600">Email</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-600">Phone</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.map((student, index) => (
                                        <tr key={index} className="border-b border-slate-100">
                                            <td className="px-4 py-2 text-slate-500">{index + 1}</td>
                                            <td className="px-4 py-2 font-medium">{student.firstName} {student.lastName}</td>
                                            <td className="px-4 py-2">{student.admissionNo}</td>
                                            <td className="px-4 py-2">{student.gender}</td>
                                            <td className="px-4 py-2 text-slate-500">{student.email || '—'}</td>
                                            <td className="px-4 py-2 text-slate-500">{student.phone || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => { setStep('upload'); setParsedData([]); }}
                            className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                        >
                            {loading ? 'Importing...' : `Import ${parsedData.length} Students`}
                        </button>
                    </div>
                </div>
            )}

            {step === 'result' && result && (
                <div className="space-y-6">
                    <div className={`p-6 rounded-xl border ${result.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
                        }`}>
                        <div className="flex items-center gap-4 mb-4">
                            {result.failed === 0 ? (
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            ) : (
                                <AlertCircle className="w-8 h-8 text-amber-600" />
                            )}
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Import {result.failed === 0 ? 'Complete' : 'Completed with Errors'}
                                </h2>
                                <p className="text-slate-600">
                                    {result.imported} students imported successfully
                                    {result.failed > 0 && `, ${result.failed} failed`}
                                </p>
                            </div>
                        </div>

                        {result.errors.length > 0 && (
                            <div className="mt-4 bg-white rounded-lg p-4 max-h-48 overflow-y-auto">
                                <h3 className="font-medium text-slate-900 mb-2">Errors:</h3>
                                <ul className="space-y-1 text-sm">
                                    {result.errors.map((err, i) => (
                                        <li key={i} className="text-red-600">
                                            Row {err.row}: {err.message}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => router.push('/admin/students')}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Go to Students
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
