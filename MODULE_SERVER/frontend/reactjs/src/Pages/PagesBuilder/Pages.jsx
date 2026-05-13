import React, { useState, useEffect, useCallback } from 'react'
import api from '../../Services/api';
import { useNavigate } from 'react-router';

export default function Pages() {
    const navigate = useNavigate();
    
    // State untuk data pages
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State untuk modal create
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        title: '',
        slug: '',
        summary: ''
    });
    
    // State untuk modal edit
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        slug: '',
        title: '',
        summary: ''
    });
    const [originalSlug, setOriginalSlug] = useState('');
    
    // State untuk modal delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState({ slug: '', title: '' });

    // Fetch all pages
    const fetchPages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/pages');
            setPages(response.data.data.pages);
            setError(null);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    // Error handler
    const handleError = (err) => {
        const data = err.response?.data;
        if (data?.errors) {
            const message = Object.values(data.errors).flat().join(" | ");
            setError(message);
        } else if (data?.message) {
            setError(data.message);
        } else if (err.message) {
            setError(err.message);
        } else {
            setError("Terjadi kesalahan");
        }
    };

    // Logout handler
    const handleLogout = async () => {
        try {
            await api.post("/logout");
            alert("Logout berhasil");
            navigate("/");
        } catch (err) {
            handleError(err);
        }
    };

    // Auto generate slug from title
    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    // Create page handlers
    const handleCreateTitleChange = (e) => {
        const title = e.target.value;
        setCreateForm({
            ...createForm,
            title: title,
            slug: generateSlug(title)
        });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/pages', createForm);
            setPages([...pages, response.data.data]);
            setShowCreateModal(false);
            setCreateForm({ title: '', slug: '', summary: '' });
            setError(null);
        } catch (err) {
            handleError(err);
        }
    };

    // Edit page handlers
    const openEditModal = (page) => {
        setEditForm({
            slug: page.slug,
            title: page.title,
            summary: page.summary || ''
        });
        setOriginalSlug(page.slug);
        setShowEditModal(true);
    };

    const handleEditTitleChange = (e) => {
        const title = e.target.value;
        setEditForm({
            ...editForm,
            title: title,
            slug: generateSlug(title)
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/pages/${originalSlug}`, editForm);
            setPages(pages.map(page => 
                page.slug === originalSlug ? response.data.data : page
            ));
            setShowEditModal(false);
            setError(null);
        } catch (err) {
            handleError(err);
        }
    };

    // Delete page handlers
    const openDeleteModal = (page) => {
        setDeleteTarget({ slug: page.slug, title: page.title });
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/pages/${deleteTarget.slug}`);
            setPages(pages.filter(page => page.slug !== deleteTarget.slug));
            setShowDeleteModal(false);
            setError(null);
        } catch (err) {
            handleError(err);
        }
    };

    const userName = localStorage.getItem("name") || "User";

    return (
        <>
            <div className="app-layout">
                <nav className="navbar">
                    <a href="pages.html" className="navbar__brand">
                        WelBuilder
                    </a>
                    <div className="navbar__actions">
                        <button className="navbar__menu-toggle" type="button" aria-label="Menu">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                        <button className="btn btn--ghost btn--sm" type="button">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="6.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M1 12c0-2.485 2.462-4.5 5.5-4.5S12 9.515 12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                            </svg>
                            {userName}
                        </button>
                        <button onClick={handleLogout} className="btn btn--ghost btn--sm" type="button">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 1h3v1.5L9.5 4h2V11H1.5V4h2L5 2.5V1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M9 7.5L7 9.5l-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </nav>

                <main className="app-main">
                    <div className="page-container">
                        <div className="page-header">
                            <div className="page-header__left">
                                <h1 className="page-title">My Pages</h1>
                                <p className="page-subtitle">
                                    {loading ? 'Loading...' : `${pages.length} pages · manage your web content`}
                                </p>
                            </div>
                            <div>
                                <button 
                                    className="btn btn--primary" 
                                    type="button"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                                    </svg>
                                    New Page
                                    <span className="kbd">Alt+N</span>
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                backgroundColor: '#fee2e2',
                                border: '1px solid #ef4444',
                                borderRadius: '6px',
                                color: '#dc2626',
                                marginBottom: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span>{error}</span>
                                <button 
                                    onClick={() => setError(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#dc2626',
                                        cursor: 'pointer',
                                        fontSize: '18px'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                Loading pages...
                            </div>
                        ) : pages.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                No pages yet. Create your first page!
                            </div>
                        ) : (
                            <div className="pages-grid">
                                {pages.map((page) => (
                                    <div key={page.id} className="page-item">
                                        <div className="page-item__info">
                                            <span className="page-item__title">
                                                <a href={`builder.html?page=${page.slug}`}>{page.title}</a>
                                                <span className="page-item__title-arrow">→</span>
                                            </span>
                                            <div className="page-item__meta">
                                                <span className="page-item__slug">/{page.slug}</span>
                                                {page.summary && (
                                                    <span className="page-item__summary">{page.summary}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="page-item__actions">
                                            <button 
                                                className="btn btn--ghost btn--sm"
                                                onClick={() => navigate(`/builder?page=${page.slug}`)}
                                            >
                                                Build
                                            </button>
                                            <button 
                                                className="btn btn--ghost btn--sm" 
                                                type="button"
                                                onClick={() => openEditModal(page)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="btn btn--danger btn--sm" 
                                                type="button"
                                                onClick={() => openDeleteModal(page)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Create Page Modal */}
            {showCreateModal && (
                <div className="modal-backdrop">
                    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-create-title">
                        <div className="modal__header">
                            <h2 className="modal__title" id="modal-create-title">New Page</h2>
                            <button 
                                className="modal__close" 
                                type="button" 
                                aria-label="Close"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setCreateForm({ title: '', slug: '', summary: '' });
                                    setError(null);
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit}>
                            <div className="modal__body">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="new-title">Title</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        id="new-title"
                                        name="title"
                                        placeholder="e.g. Homepage"
                                        value={createForm.title}
                                        onChange={handleCreateTitleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="new-slug">Slug</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        id="new-slug"
                                        name="slug"
                                        placeholder="e.g. homepage"
                                        value={createForm.slug}
                                        onChange={(e) => setCreateForm({...createForm, slug: e.target.value})}
                                        required
                                    />
                                    <span className="form-hint">Auto-generated from title. Lowercase, no spaces.</span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="new-summary">
                                        Summary <span className="form-hint">(optional)</span>
                                    </label>
                                    <textarea
                                        className="form-input"
                                        id="new-summary"
                                        name="summary"
                                        placeholder="Brief description of this page…"
                                        value={createForm.summary}
                                        onChange={(e) => setCreateForm({...createForm, summary: e.target.value})}
                                        rows="3"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="modal__footer">
                                <button 
                                    className="btn btn--ghost" 
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setCreateForm({ title: '', slug: '', summary: '' });
                                        setError(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button className="btn btn--primary" type="submit">
                                    Save Page
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Page Modal */}
            {showEditModal && (
                <div className="modal-backdrop">
                    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-edit-title">
                        <div className="modal__header">
                            <h2 className="modal__title" id="modal-edit-title">Edit Page</h2>
                            <button 
                                className="modal__close" 
                                type="button" 
                                aria-label="Close"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setError(null);
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit}>
                            <div className="modal__body">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="edit-title">Title</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        id="edit-title"
                                        name="title"
                                        placeholder="e.g. Homepage"
                                        value={editForm.title}
                                        onChange={handleEditTitleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="edit-slug">Slug</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        id="edit-slug"
                                        name="slug"
                                        placeholder="e.g. homepage"
                                        value={editForm.slug}
                                        onChange={(e) => setEditForm({...editForm, slug: e.target.value})}
                                        required
                                    />
                                    <span className="form-hint">Auto-generated from title. Lowercase, no spaces.</span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="edit-summary">
                                        Summary <span className="form-hint">(optional)</span>
                                    </label>
                                    <textarea
                                        className="form-input"
                                        id="edit-summary"
                                        name="summary"
                                        placeholder="Brief description of this page…"
                                        value={editForm.summary}
                                        onChange={(e) => setEditForm({...editForm, summary: e.target.value})}
                                        rows="3"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="modal__footer">
                                <button 
                                    className="btn btn--ghost" 
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setError(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button className="btn btn--primary" type="submit">
                                    Update Page
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-backdrop">
                    <div className="modal confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-delete-title">
                        <div className="modal__header">
                            <h2 className="modal__title" id="modal-delete-title">Delete Page</h2>
                            <button 
                                className="modal__close" 
                                type="button" 
                                aria-label="Close"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setError(null);
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal__body">
                            <div className="confirm-dialog__icon">
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11 4v7" stroke="#c0392b" strokeWidth="2" strokeLinecap="square" />
                                    <circle cx="11" cy="16" r="1" fill="#c0392b" />
                                    <path d="M3 19L11 3l8 16H3z" stroke="#c0392b" strokeWidth="2" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className="confirm-dialog__text">
                                Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>?<br />
                                This action cannot be undone.
                            </p>
                        </div>

                        <div className="modal__footer">
                            <button 
                                className="btn btn--ghost" 
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setError(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn--danger" 
                                type="button"
                                onClick={handleDelete}
                            >
                                Ok, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}