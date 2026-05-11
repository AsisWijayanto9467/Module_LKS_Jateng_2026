import React from 'react'
import api from '../../Services/api';
import { useNavigate } from 'react-router';

export default function Pages() {

    const navigate = useNavigate();

    const handleLogout = async() => {
        try {
            await api.post("/logout");

            alert("Logout berhasil");
            navigate("/");
        } catch (err) {
            const data = err.response?.data;

            if(data?.errors) {
                const message = Object.values(data.errors).flat().join(" | ");
                setError(message);
            } else if(data?.message) {
                setError(data.message);
            } else if(err.message) {
                setError(err.message)
            } else {
                setError("terjadi kesalahan");
            }
        } finally {
            setError(false);
        }
    }

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
                                <circle cx="6.5" cy="4.5" r="2.5" stroke="currentColor" stroke-width="1.5" />
                                <path d="M1 12c0-2.485 2.462-4.5 5.5-4.5S12 9.515 12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" />
                            </svg>
                            John Doe
                        </button>
                        <button onClick={handleLogout} className="btn btn--ghost btn--sm" type="button">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 1h3v1.5L9.5 4h2V11H1.5V4h2L5 2.5V1z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                                <path d="M9 7.5L7 9.5l-2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="round" />
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
                                <p className="page-subtitle">3 pages · manage your web content</p>
                            </div>
                            <div>
                                <button className="btn btn--primary" type="button">
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" />
                                    </svg>
                                    New Page
                                    <span className="kbd">Alt+N</span>
                                </button>
                            </div>
                        </div>

                        <div className="pages-grid">

                            <div className="page-item">
                                <div className="page-item__info">
                                    <span className="page-item__title">
                                        <a href="builder.html">Homepage</a>
                                        <span className="page-item__title-arrow">→</span>
                                    </span>
                                    <div className="page-item__meta">
                                        <span className="page-item__slug">/homepage</span>
                                        <span className="page-item__summary">Landing page for our main product with hero section and features overview.</span>
                                    </div>
                                </div>
                                <div className="page-item__actions">
                                    <a href="builder.html" className="btn btn--ghost btn--sm">
                                        Build
                                    </a>
                                    <button className="btn btn--ghost btn--sm" type="button">
                                        Edit
                                    </button>
                                    <button className="btn btn--danger btn--sm" type="button">
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="page-item">
                                <div className="page-item__info">
                                    <span className="page-item__title">
                                        <a href="builder.html">About Us</a>
                                        <span className="page-item__title-arrow">→</span>
                                    </span>
                                    <div className="page-item__meta">
                                        <span className="page-item__slug">/about</span>
                                        <span className="page-item__summary">Company story, mission statement, and team introduction.</span>
                                    </div>
                                </div>
                                <div className="page-item__actions">
                                    <a href="builder.html" className="btn btn--ghost btn--sm">
                                        Build
                                    </a>
                                    <button className="btn btn--ghost btn--sm" type="button">
                                        Edit
                                    </button>
                                    <button className="btn btn--danger btn--sm" type="button">
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="page-item">
                                <div className="page-item__info">
                                    <span className="page-item__title">
                                        <a href="builder.html">Contact</a>
                                        <span className="page-item__title-arrow">→</span>
                                    </span>
                                    <div className="page-item__meta">
                                        <span className="page-item__slug">/contact</span>
                                    </div>
                                </div>
                                <div className="page-item__actions">
                                    <a href="builder.html" className="btn btn--ghost btn--sm">
                                        Build
                                    </a>
                                    <button className="btn btn--ghost btn--sm" type="button">
                                        Edit
                                    </button>
                                    <button className="btn btn--danger btn--sm" type="button">
                                        Delete
                                    </button>
                                </div>
                            </div>

                        </div>

                    </div>
                </main>

            </div>


            <div className="modal-backdrop">
                <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-create-title">

                    <div className="modal__header">
                        <h2 className="modal__title" id="modal-create-title">New Page</h2>
                        <button className="modal__close" type="button" aria-label="Close">✕</button>
                    </div>

                    <div className="modal__body">

                        <div className="form-group">
                            <label className="form-label" htmlFor="new-title">Title</label>
                            <input
                                className="form-input"
                                type="text"
                                id="new-title"
                                name="title"
                                placeholder="e.g. Homepage"
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
                            />
                            <span className="form-hint">Auto-generated from title. Lowercase, no spaces.</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="new-summary">Summary <span className="form-hint">(optional)</span></label>
                            <textarea
                                className="form-input"
                                id="new-summary"
                                name="summary"
                                placeholder="Brief description of this page…"
                            ></textarea>
                        </div>

                    </div>

                    <div className="modal__footer">
                        <button className="btn btn--ghost" type="button">Cancel</button>
                        <button className="btn btn--primary" type="button">Save Page</button>
                    </div>

                </div>
            </div>
{/* 
            <div className="modal-backdrop">
                <div className="modal confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-delete-title">

                    <div className="modal__header">
                        <h2 className="modal__title" id="modal-delete-title">Delete Page</h2>
                        <button className="modal__close" type="button" aria-label="Close">✕</button>
                    </div>

                    <div className="modal__body">
                        <div className="confirm-dialog__icon">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4v7" stroke="#c0392b" stroke-width="2" stroke-linecap="square" />
                                <circle cx="11" cy="16" r="1" fill="#c0392b" />
                                <path d="M3 19L11 3l8 16H3z" stroke="#c0392b" stroke-width="2" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <p className="confirm-dialog__text">
                            Are you sure you want to delete <strong>"Homepage"</strong>?<br>
                                This action cannot be undone.
                        </p>
                    </div>

                    <div className="modal__footer">
                        <button className="btn btn--ghost" type="button">Cancel</button>
                        <button className="btn btn--danger" type="button">Ok, Delete</button>
                    </div>

                </div>
            </div> */}
        </>
    )
}
