import { redirect } from 'next/navigation';
import { Library } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getBooks, getCategories, getActiveIssues, getStudentsForLibrary } from './actions';
import BookCatalog from './book-catalog';
import IssueManager from './issue-manager';

export default async function LibraryPage() {
    const session = await auth();
    if (!session) redirect('/auth/login');

    const [books, categories, issues, students] = await Promise.all([
        getBooks(),
        getCategories(),
        getActiveIssues(),
        getStudentsForLibrary(),
    ]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-2">
                    <span>Admin</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Library</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Library className="text-blue-600" />
                    Library Management
                </h1>
                <p className="text-slate-500 mt-1">Manage book catalog, issue and return books.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Book Catalog - 2 columns */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Book Catalog</h2>
                        <BookCatalog books={books as any} categories={categories as any} />
                    </div>
                </div>

                {/* Issue/Return - 1 column */}
                <div>
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Issue / Return</h2>
                        <IssueManager
                            issues={issues as any}
                            books={books as any}
                            students={students as any}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
