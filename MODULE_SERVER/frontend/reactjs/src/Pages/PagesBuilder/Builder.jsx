import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../Services/api";

export default function Builder() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pageSlug = searchParams.get("page");

    // State untuk data page dan sections
    const [pageData, setPageData] = useState(null);
    const [sections, setSections] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savingFields, setSavingFields] = useState({});

    // State untuk expanded section (section yang sedang diedit)
    const [expandedSectionId, setExpandedSectionId] = useState(null);
    const [editingFields, setEditingFields] = useState({});

    // State untuk add section form
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [newSection, setNewSection] = useState({
        name: "",
        template_id: "",
        position: ""
    });

    // State untuk delete confirmation
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Fetch page data dan templates
    const fetchPageData = useCallback(async () => {
        if (!pageSlug) {
            setError("No page specified");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // Fetch page by slug (gunakan get all dan filter)
            const pagesResponse = await api.get('/pages');
            const currentPage = pagesResponse.data.data.pages.find(
                p => p.slug === pageSlug
            );

            if (!currentPage) {
                setError("Page not found");
                setLoading(false);
                return;
            }

            // Fetch page detail dengan sections
            const pageDetailResponse = await api.get(`/pages/${currentPage.id}`);
            setPageData(pageDetailResponse.data.data);
            setSections(pageDetailResponse.data.data.sections || []);

            // Fetch templates
            const templatesResponse = await api.get('/templates');
            setTemplates(templatesResponse.data.data.templates);

            setError(null);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [pageSlug]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

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
            setError("An error occurred");
        }
    };

    // Logout handler
    const handleLogout = async () => {
        try {
            await api.post("/logout");
            localStorage.removeItem("token");
            localStorage.removeItem("name");
            navigate("/");
        } catch (err) {
            handleError(err);
        }
    };

    // Toggle expand/collapse section
    const toggleSection = (sectionId) => {
        if (expandedSectionId === sectionId) {
            setExpandedSectionId(null);
            setEditingFields({});
        } else {
            setExpandedSectionId(sectionId);
            // Initialize editing fields dari section data
            const section = sections.find(s => s.id === sectionId);
            if (section && section.fields) {
                const fieldsState = {};
                section.fields.forEach(field => {
                    fieldsState[field.id] = field.value || "";
                });
                setEditingFields(fieldsState);
            }
        }
    };

    // Handle field change di expanded section
    const handleFieldChange = (fieldId) => (e) => {
        setEditingFields(prev => ({
            ...prev,
            [fieldId]: e.target.value
        }));
    };

    // Handle new section form changes
    const handleNewSectionChange = (field) => (e) => {
        setNewSection(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    // Add new section
    const handleAddSection = async () => {
        if (!newSection.template_id || !newSection.position) {
            setError("Template and position are required");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post(
                `/pages/${pageSlug}/sections`,
                {
                    template_id: parseInt(newSection.template_id),
                    position: parseInt(newSection.position),
                    name: newSection.name || "New Section"
                }
            );

            setSections(prev => [...prev, response.data.data]);
            setShowAddPanel(false);
            setNewSection({ name: "", template_id: "", position: "" });
            setError(null);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    // Save section fields
    const handleSaveFields = async (sectionId) => {
        const fields = Object.entries(editingFields).map(([fieldId, value]) => ({
            field_id: parseInt(fieldId),
            value: value
        }));

        setSavingFields(prev => ({ ...prev, [sectionId]: true }));

        try {
            const response = await api.put(
                `/pages/${pageSlug}/sections/${sectionId}/fields`,
                { fields }
            );

            // Update sections state dengan data baru
            setSections(prev =>
                prev.map(section =>
                    section.id === sectionId
                        ? { ...section, fields: response.data.data.fields }
                        : section
                )
            );

            setExpandedSectionId(null);
            setEditingFields({});
            setError(null);
        } catch (err) {
            handleError(err);
        } finally {
            setSavingFields(prev => ({ ...prev, [sectionId]: false }));
        }
    };

    // Discard field changes
    const handleDiscardFields = () => {
        setExpandedSectionId(null);
        setEditingFields({});
    };

    // Delete section
    const handleDeleteSection = async (sectionId) => {
        try {
            await api.delete(`/pages/${pageSlug}/sections/${sectionId}`);
            setSections(prev => prev.filter(s => s.id !== sectionId));
            if (expandedSectionId === sectionId) {
                setExpandedSectionId(null);
                setEditingFields({});
            }
            setDeleteTarget(null);
            setError(null);
        } catch (err) {
            handleError(err);
        }
    };

    const userName = localStorage.getItem("name") || "User";

    if (loading && !pageData) {
        return (
            <div className="app-layout">
                <nav className="navbar">
                    <a href="/pages" className="navbar__brand">WelBuilder</a>
                </nav>
                <div className="app-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                    Loading builder...
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="app-layout">
                <nav className="navbar">
                    <a href="/pages" className="navbar__brand">
                        WelBuilder
                    </a>
                    <div className="navbar__actions">
                        <button className="navbar__menu-toggle" type="button" aria-label="Menu">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                        <button className="btn btn--ghost btn--sm" type="button">
                            <svg
                                width="13"
                                height="13"
                                viewBox="0 0 13 13"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle cx="6.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M1 12c0-2.485 2.462-4.5 5.5-4.5S12 9.515 12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                            </svg>
                            {userName}
                        </button>
                        <button className="btn btn--ghost btn--sm" type="button" onClick={handleLogout}>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 1h3v1.5L9.5 4h2V11H1.5V4h2L5 2.5V1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M9 7.5L7 9.5l-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </nav>

                <div className="app-main">
                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#fee2e2',
                            border: '1px solid #ef4444',
                            borderRadius: '6px',
                            color: '#dc2626',
                            margin: '16px',
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

                    <div className="builder-layout">
                        <div className="builder-main">
                            <div className="builder-toolbar">
                                <div className="builder-toolbar__left">
                                    <div className="builder-breadcrumb">
                                        <a href="/pages">Pages</a>
                                        <span>→</span>
                                        <span>{pageData?.title || pageSlug}</span>
                                    </div>
                                    <div className="builder-toolbar__divider"></div>
                                    <span className="tag">{sections.length} sections</span>
                                </div>
                                <div className="navbar__actions">
                                    <button
                                        className="btn btn--primary btn--sm"
                                        type="button"
                                        onClick={() => setShowAddPanel(!showAddPanel)}
                                    >
                                        <svg
                                            width="13"
                                            height="13"
                                            viewBox="0 0 13 13"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                                        </svg>
                                        Add Section
                                    </button>
                                    <button 
                                        className="btn btn--ghost btn--sm" 
                                        type="button"
                                        onClick={() => navigate(`/preview?page=${pageSlug}`)}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 6.5C1 6.5 3 2 6.5 2S12 6.5 12 6.5 10 11 6.5 11 1 6.5 1 6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                            <circle cx="6.5" cy="6.5" r="1.75" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                        Preview
                                    </button>
                                </div>
                            </div>

                            <div className="builder-canvas">
                                {sections.map((section, index) => {
                                    const isExpanded = expandedSectionId === section.id;
                                    const isSaving = savingFields[section.id];

                                    return (
                                        <div
                                            key={section.id}
                                            className={`field-editor ${isExpanded ? 'field-editor--open' : ''}`}
                                        >
                                            <div className="field-editor__header">
                                                <div>
                                                    <div className="field-editor__title">
                                                        <span className="tag">
                                                            {String(index + 1).padStart(2, '0')}
                                                        </span>
                                                        &nbsp; {section.template?.name || `Section ${index + 1}`}
                                                    </div>
                                                    <div className="field-editor__meta">
                                                        template: {section.template?.slug || 'unknown'}
                                                        {section.fields && ` · ${section.fields.length} fields`}
                                                    </div>
                                                </div>
                                                <div
                                                    className="field-editor__toggle"
                                                    onClick={() => toggleSection(section.id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                                                    <svg
                                                        className="field-editor__chevron"
                                                        width="12"
                                                        height="8"
                                                        viewBox="0 0 12 8"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d={isExpanded ? "M1 7l5-5 5 5" : "M1 1l5 5 5-5"}
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                            strokeLinecap="square"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <>
                                                    <div className="field-editor__body">
                                                        {section.fields && section.fields.map((field) => (
                                                            <div key={field.id} className="form-group">
                                                                <label className="form-label" htmlFor={`field-${field.id}`}>
                                                                    {field.name}
                                                                </label>
                                                                {field.type === 'textarea' ? (
                                                                    <textarea
                                                                        className="form-input"
                                                                        id={`field-${field.id}`}
                                                                        placeholder={`Enter ${field.name.toLowerCase()}…`}
                                                                        value={editingFields[field.id] || ""}
                                                                        onChange={handleFieldChange(field.id)}
                                                                        rows="3"
                                                                    />
                                                                ) : (
                                                                    <input
                                                                        className="form-input"
                                                                        type={field.type === 'url' ? 'url' : 'text'}
                                                                        id={`field-${field.id}`}
                                                                        placeholder={`Enter ${field.name.toLowerCase()}…`}
                                                                        value={editingFields[field.id] || ""}
                                                                        onChange={handleFieldChange(field.id)}
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="field-editor__footer">
                                                        <div className="shortcuts-hint">
                                                            <span className="kbd">Esc</span> to close
                                                        </div>
                                                        <div className="field-editor__footer-actions">
                                                            <button
                                                                className="btn btn--ghost btn--sm"
                                                                type="button"
                                                                onClick={handleDiscardFields}
                                                            >
                                                                Discard
                                                            </button>
                                                            <button
                                                                className="btn btn--danger btn--sm"
                                                                type="button"
                                                                onClick={() => setDeleteTarget(section)}
                                                                style={{ marginRight: '8px' }}
                                                            >
                                                                Remove
                                                            </button>
                                                            <button
                                                                className="btn btn--primary btn--sm"
                                                                type="button"
                                                                onClick={() => handleSaveFields(section.id)}
                                                                disabled={isSaving}
                                                            >
                                                                {isSaving ? 'Saving...' : 'Save'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}

                                {showAddPanel && (
                                    <div className="add-section-panel">
                                        <div className="add-section-panel__header">
                                            <span className="add-section-panel__title">Add Section</span>
                                            <button
                                                className="btn btn--ghost btn--sm btn--icon"
                                                type="button"
                                                onClick={() => setShowAddPanel(false)}
                                            >
                                                <svg
                                                    width="11"
                                                    height="11"
                                                    viewBox="0 0 11 11"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="form-wrap">
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label className="form-label" htmlFor="section-name">
                                                    Section Name
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    id="section-name"
                                                    placeholder="e.g. Hero Section"
                                                    value={newSection.name}
                                                    onChange={handleNewSectionChange('name')}
                                                />
                                            </div>
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label className="form-label" htmlFor="section-template">
                                                    Section Template
                                                </label>
                                                <select
                                                    className="form-input"
                                                    id="section-template"
                                                    value={newSection.template_id}
                                                    onChange={handleNewSectionChange('template_id')}
                                                >
                                                    <option value="" disabled>Choose a template…</option>
                                                    {templates.map((template) => (
                                                        <option key={template.id} value={template.id}>
                                                            {template.slug} — {template.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label className="form-label" htmlFor="section-position">
                                                    Position
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    id="section-position"
                                                    placeholder={String(sections.length + 1)}
                                                    value={newSection.position}
                                                    onChange={handleNewSectionChange('position')}
                                                    min="1"
                                                />
                                            </div>
                                            <button
                                                className="btn btn--primary"
                                                type="button"
                                                style={{ alignSelf: 'flex-start' }}
                                                onClick={handleAddSection}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="modal-backdrop">
                    <div className="modal confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-remove-title">
                        <div className="modal__header">
                            <h2 className="modal__title" id="modal-remove-title">Remove Section</h2>
                            <button
                                className="modal__close"
                                type="button"
                                aria-label="Close"
                                onClick={() => setDeleteTarget(null)}
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
                                Remove <strong>"{deleteTarget.template?.name || 'Section'}"</strong> from this page?<br />
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal__footer">
                            <button
                                className="btn btn--ghost"
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn--danger"
                                type="button"
                                onClick={() => handleDeleteSection(deleteTarget.id)}
                            >
                                Ok, Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}