'use client';

import { useState } from 'react';
import { Plus, Trash2, BookOpen, Loader2, X } from 'lucide-react';
import { createBook, deleteBook, createCategory } from './actions';

type Book = {
    id: string;
    title: string;
    author: string;
    isbn: string | null;
    quantity: number;
    available: number;
    location: string | null;
    category: { name: string } | null;
};

type Category = { id: string; name: string; _count: { books: number } };

export default function BookCatalog({
    books,
    categories,
}: {
    books: Book[];
    categories: Category[];
}) {
    const [showAddBook, setShowAddBook] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookForm, setBookForm] = useState({
        title: '',
        author: '',
        categoryId: '',
        isbn: '',
        publisher: '',
        publishYear: '',
        quantity: '1',
        location: '',
    });
    const [categoryName, setCategoryName] = useState('');

    const handleAddBook = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await createBook({
            title: bookForm.title,
            author: bookForm.author,
            categoryId: bookForm.categoryId || undefined,
            isbn: bookForm.isbn || undefined,
            publisher: bookForm.publisher || undefined,
            publishYear: bookForm.publishYear ? parseInt(bookForm.publishYear) : undefined,
            quantity: parseInt(bookForm.quantity) || 1,
            location: bookForm.location || undefined,
        });
        setBookForm({ title: '', author: '', categoryId: '', isbn: '', publisher: '', publishYear: '', quantity: '1', location: '' });
        setShowAddBook(false);
        setIsSubmitting(false);
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName.trim()) return;
        setIsSubmitting(true);
        await createCategory(categoryName.trim());
        setCategoryName('');
        setShowAddCategory(false);
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this book?')) {
            await deleteBook(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => setShowAddBook(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={18} /> Add Book
                </button>
                <button
                    onClick={() => setShowAddCategory(true)}
                    className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200"
                >
                    <Plus size={18} /> Add Category
                </button>
            </div>

            {/* Categories Summary */}
            <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                    <span key={cat.id} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {cat.name} ({cat._count.books})
                    </span>
                ))}
            </div>

            {/* Add Book Modal */}
            {showAddBook && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Add New Book</h3>
                            <button onClick={() => setShowAddBook(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddBook} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Title *"
                                value={bookForm.title}
                                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Author *"
                                value={bookForm.author}
                                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            />
                            <select
                                value={bookForm.categoryId}
                                onChange={(e) => setBookForm({ ...bookForm, categoryId: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2"
                            >
                                <option value="">No Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" placeholder="ISBN" value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} className="border rounded-lg px-3 py-2" />
                                <input type="text" placeholder="Publisher" value={bookForm.publisher} onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })} className="border rounded-lg px-3 py-2" />
                                <input type="number" placeholder="Year" value={bookForm.publishYear} onChange={(e) => setBookForm({ ...bookForm, publishYear: e.target.value })} className="border rounded-lg px-3 py-2" />
                                <input type="number" placeholder="Quantity" value={bookForm.quantity} onChange={(e) => setBookForm({ ...bookForm, quantity: e.target.value })} className="border rounded-lg px-3 py-2" min="1" />
                            </div>
                            <input type="text" placeholder="Location (Shelf/Row)" value={bookForm.location} onChange={(e) => setBookForm({ ...bookForm, location: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Add Book'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Category Modal */}
            {showAddCategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold mb-4">Add Category</h3>
                        <form onSubmit={handleAddCategory} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Category Name"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            />
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowAddCategory(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">{isSubmitting ? '...' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Books Table */}
            {books.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No books in catalog yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-medium text-slate-500">Title</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-slate-500">Author</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-slate-500">Category</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-slate-500">Available</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-slate-500">Location</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-slate-500"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {books.map(book => (
                                <tr key={book.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium">{book.title}</td>
                                    <td className="px-4 py-3 text-slate-600">{book.author}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
                                            {book.category?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={book.available > 0 ? 'text-green-600' : 'text-red-600'}>
                                            {book.available}/{book.quantity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-slate-500">{book.location || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => handleDelete(book.id)} className="p-1 text-slate-400 hover:text-red-600">
                                            <Trash2 size={16} />
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
