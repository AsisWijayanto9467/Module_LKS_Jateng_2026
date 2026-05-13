import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../Services/api";

export default function Preview() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pageSlug = searchParams.get("page");

    const [pageData, setPageData] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPageData = useCallback(async () => {
        if (!pageSlug) {
            setError("No page specified");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // Fetch all pages untuk mendapatkan page ID
            const pagesResponse = await api.get('/pages');
            const currentPage = pagesResponse.data.data.pages.find(
                p => p.slug === pageSlug
            );

            if (!currentPage) {
                setError("Page not found");
                setLoading(false);
                return;
            }

            // Fetch page detail dengan sections dan fields
            const pageDetailResponse = await api.get(`/pages/${currentPage.id}`);
            setPageData(pageDetailResponse.data.data);
            setSections(pageDetailResponse.data.data.sections || []);
            setError(null);
        } catch (err) {
            const data = err.response?.data;
            if (data?.message) {
                setError(data.message);
            } else {
                setError("Failed to load page data");
            }
        } finally {
            setLoading(false);
        }
    }, [pageSlug]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    // Helper untuk mendapatkan nilai field dari section
    const getFieldValue = (section, fieldName) => {
        if (!section.fields) return null;
        const field = section.fields.find(
            f => f.name === fieldName || f.slug === fieldName
        );
        return field?.value || null;
    };

    // Render section berdasarkan template slug
    const renderSection = (section, index) => {
        const templateSlug = section.template?.slug;
        const sectionNumber = String(index + 1).padStart(2, '0');

        switch (templateSlug) {
            case 'hero-banner':
                return renderHeroBanner(section, sectionNumber);
            case 'feature-grid':
                return renderFeatureGrid(section, sectionNumber);
            case 'cta-strip':
                return renderCtaStrip(section, sectionNumber);
            case 'hero':
                return renderHero(section, sectionNumber);
            case 'about':
                return renderAbout(section, sectionNumber);
            case 'services':
                return renderServices(section, sectionNumber);
            case 'contact':
                return renderContact(section, sectionNumber);
            case 'footer':
                return renderFooter(section, sectionNumber);
            default:
                return renderGenericSection(section, sectionNumber, templateSlug);
        }
    };

    // Hero Banner Section
    const renderHeroBanner = (section, sectionNumber) => {
        const heading = getFieldValue(section, 'heading') || 'Build Beautiful Pages, Fast.';
        const subtitle = getFieldValue(section, 'subtitle') || 'The visual page builder for modern teams.';
        const buttonLabel = getFieldValue(section, 'button_label') || getFieldValue(section, 'buttonLabel') || 'Get Started';
        const backgroundImage = getFieldValue(section, 'background_image') || getFieldValue(section, 'backgroundImage') || '';

        return (
            <div className="preview-section" key={section.id}>
                <div className="preview-section__label">
                    <span className="preview-section__num">{sectionNumber}</span>
                    <span className="preview-section__template-name">hero-banner</span>
                </div>
                <div className="preview-section__body">
                    <div className="preview-hero">
                        <h1 className="preview-hero__title">{heading}</h1>
                        <p className="preview-hero__subtitle">{subtitle}</p>
                        <div>
                            <button className="btn btn--primary" type="button">
                                {buttonLabel}
                            </button>
                        </div>
                        <div className="preview-hero__image-placeholder">
                            {backgroundImage ? backgroundImage : 'No image URL provided'}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Feature Grid Section
    const renderFeatureGrid = (section, sectionNumber) => {
        const heading = getFieldValue(section, 'heading') || 'Why WelBuilder?';
        const features = [];
        
        for (let i = 1; i <= 4; i++) {
            const title = getFieldValue(section, `feature_${i}_title`) || `Feature ${i}`;
            const text = getFieldValue(section, `feature_${i}_text`) || `Description for feature ${i}`;
            features.push({ title, text });
        }

        const icons = [
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="16" height="16" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 9h8M9 5v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>,
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 5v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>,
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3h12v12H3z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 7h6M6 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>,
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 1l2.5 5 5.5.8-4 3.9.9 5.5L9 13.5l-4.9 2.7.9-5.5-4-3.9L6.5 6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
        ];

        return (
            <div className="preview-section" key={section.id}>
                <div className="preview-section__label">
                    <span className="preview-section__num">{sectionNumber}</span>
                    <span className="preview-section__template-name">feature-grid</span>
                </div>
                <div className="preview-section__body">
                    <div className="preview-features">
                        <div className="preview-features__heading">{heading}</div>
                        <div className="preview-features__grid">
                            {features.map((feature, i) => (
                                <div className="preview-feature-card" key={i}>
                                    <div className="preview-feature-card__icon">{icons[i]}</div>
                                    <div className="preview-feature-card__title">{feature.title}</div>
                                    <div className="preview-feature-card__text">{feature.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // CTA Strip Section
    const renderCtaStrip = (section, sectionNumber) => {
        const text = getFieldValue(section, 'text') || getFieldValue(section, 'cta_text') || 'Ready to build your first page?';
        const buttonLabel = getFieldValue(section, 'button_label') || getFieldValue(section, 'buttonLabel') || 'Start Building →';

        return (
            <div className="preview-section" key={section.id}>
                <div className="preview-section__label">
                    <span className="preview-section__num">{sectionNumber}</span>
                    <span className="preview-section__template-name">cta-strip</span>
                </div>
                <div className="preview-section__body">
                    <div className="preview-cta">
                        <div className="preview-cta__text">{text}</div>
                        <button className="btn btn--primary" type="button">
                            {buttonLabel}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Hero Section
    const renderHero = (section, sectionNumber) => {
        const title = getFieldValue(section, 'title') || 'Shape the Future, Today.';
        const subtitle = getFieldValue(section, 'subtitle') || 'A bold new starting point for every great idea.';
        const buttonLabel = getFieldValue(section, 'button_label') || getFieldValue(section, 'buttonLabel') || 'Explore Now →';
        const backgroundImage = getFieldValue(section, 'background_image') || getFieldValue(section, 'backgroundImage') || '';

        return (
            <div className="preview-section" key={section.id}>
                <div className="preview-section__label">
                    <span className="preview-section__num">{sectionNumber}</span>
                    <span className="preview-section__template-name">hero</span>
                </div>
                <div className="preview-section__body">
                    <div className="preview-hero-section">
                        <div className="preview-hero-section__content">
                            <h2 className="preview-hero-section__title">{title}</h2>
                            <p className="preview-hero-section__subtitle">{subtitle}</p>
                            <button className="btn btn--primary" type="button">
                                {buttonLabel}
                            </button>
                        </div>
                        <div className="preview-hero-section__image-placeholder">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="1" y="1" width="30" height="30" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="10" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M1 22l8-7 6 5 5-4 11 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                            </svg>
                            <span>{backgroundImage || 'background_image'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // About Section
    const renderAbout = (section, sectionNumber) => {
        const label = getFieldValue(section, 'label') || 'About Us';
        const heading = getFieldValue(section, 'heading') || 'We build tools that get out of your way.';
        const description = getFieldValue(section, 'description') || 'WelBuilder was born from frustration with bloated, opaque content systems.';
        const image = getFieldValue(section, 'image') || '';

        return (
            <div className="preview-section" key={section.id}>
                <div className="preview-section__label">
                    <span className="preview-section__num">{sectionNumber}</span>
                    <span className="preview-section__template-name">about</span>
                </div>
                <div className="preview-section__body">
                    <div className="preview-about">
                        <div className="preview-about__image-placeholder">
                            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="1" y="1" width="30" height="30" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="10" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M1 22l8-7 6 5 5-4 11 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                            </svg>
                            <span>{image || 'image'}</span>
                        </div>
                        <div className="preview-about__body">
                            <div className="preview-about__label">{label}</div>
                            <h2 className="preview-about__heading">{heading}</h2>
                            <p className="preview-about__description">{description}</p>
                            <a href="#" className="btn btn--ghost btn--sm">
                                Learn more →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Services Section
    const renderServices = (section, sectionNumber) => {
        const heading = getFieldValue(section, 'heading') || 'Our Services';
        const services = [];
        
        for (let i = 1; i <= 3; i++) {
            const name = getFieldValue(section, `service_${i}_name`) || `Service ${i}`;
            const icon = getFieldValue(section, `service_${i}_icon`) || `service_${i}_icon`;
            services.push({ name, icon });
        }

        const icons = [
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3h16v16H3z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 11h8M11 7v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>,
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 7v4l3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>,
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 2l2.5 6 6.5 1-4.7 4.6 1.1 6.5L11 17l-5.4 3.1 1.1-6.5L2 9l6.5-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
        ];

        return (
            <div className="preview-section" key={section.id}>
                <div className="preview-section__label">
                    <span className="preview-section__num">{sectionNumber}</span>
                    <span className="preview-section__template-name">services</span>
                </div>
                <div className="preview-section__body">
                    <div className="preview-services">
                        <div className="preview-services__heading">{heading}</div>
                        <div className="preview-services__grid">
                            {services.map((service, i) => (
                                <div className="preview-service-card" key={i}>
                                    <div className="preview-service-card__icon">{icons[i]}</div>
                                    <div className="preview-service-card__name">{service.name}</div>
                                    <div className="preview-service-card__meta">{service.icon}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Contact Section
    const renderContact = (section, sectionNumber) => {
        const title = getFieldValue(section, 'title') || "Let's Talk";
        const email = getFieldValue(section, 'email') || 'hello@welbuilder.io';
        const phone = getFieldValue(section, 'phone') || '+1 (800) 555-0100';
        const mapImage = getFieldValue(section, 'map_image') || '';

        return (
            <div className="preview-section" key={section.id}>
                <div className="preview-section__label">
                    <span className="preview-section__num">{sectionNumber}</span>
                    <span className="preview-section__template-name">contact</span>
                </div>
                <div className="preview-section__body">
                    <div className="preview-contact">
                        <div className="preview-contact__left">
                            <h2 className="preview-contact__title">{title}</h2>
                            <div className="preview-contact__details">
                                <div className="preview-contact__detail">
                                    <div className="preview-contact__detail-icon">
                                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 3h14v10H1z" stroke="currentColor" strokeWidth="1.5" />
                                            <path d="M1 3l7 6 7-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                                        </svg>
                                    </div>
                                    <span className="preview-contact__detail-value">{email}</span>
                                </div>
                                <div className="preview-contact__detail">
                                    <div className="preview-contact__detail-icon">
                                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 2h4l1.5 3.5-2 1.5c.9 1.8 2.5 3.4 4.3 4.3l1.5-2L15 10.5V14c0 .6-.4 1-1 1C5.7 15 1 10.3 1 3c0-.6.4-1 1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <span className="preview-contact__detail-value">{phone}</span>
                                </div>
                            </div>
                        </div>
                        <div className="preview-contact__map-placeholder">
                            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 3C11 3 7 7 7 12c0 7 9 17 9 17s9-10 9-17c0-5-4-9-9-9z" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="16" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                            <span>{mapImage || 'map_image'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Footer Section
    const renderFooter = (section, sectionNumber) => {
        const logoUrl = getFieldValue(section, 'logo_url') || '';
        const instagramLink = getFieldValue(section, 'instagram_link') || 'instagram_link';
        const facebookLink = getFieldValue(section, 'facebook_link') || 'facebook_link';
        const copyrightText = getFieldValue(section, 'copyright_text') || '© 2025 WelBuilder. All rights reserved.';

        return (
            <div className="preview-section" key={section.id}>
                <div className="preview-section__label">
                    <span className="preview-section__num">{sectionNumber}</span>
                    <span className="preview-section__template-name">footer</span>
                </div>
                <div className="preview-section__body">
                    <div className="preview-footer">
                        <div className="preview-footer__top">
                            <div className="preview-footer__logo-placeholder">
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="1" y="1" width="16" height="16" stroke="currentColor" strokeWidth="1.5" />
                                    <rect x="5" y="5" width="8" height="8" fill="currentColor" />
                                </svg>
                                <span className="preview-footer__logo-label">{logoUrl || 'logo_url'}</span>
                            </div>
                            <div className="preview-footer__socials">
                                <a href="#" className="preview-footer__social-link" aria-label="Instagram">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="1" y="1" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" />
                                        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                                        <circle cx="12" cy="4" r="1" fill="currentColor" />
                                    </svg>
                                    <span>{instagramLink}</span>
                                </a>
                                <a href="#" className="preview-footer__social-link" aria-label="Facebook">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 1H10a4 4 0 00-4 4v2H4v3h2v5h3v-5h2.5L12 7H9V5a1 1 0 011-1h2V1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                                    </svg>
                                    <span>{facebookLink}</span>
                                </a>
                            </div>
                        </div>
                        <div className="preview-footer__bottom">
                            <span className="preview-footer__copyright">{copyrightText}</span>
                            <span className="preview-footer__copyright-label">copyright_text</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Generic Section (untuk template yang belum memiliki renderer khusus)
    const renderGenericSection = (section, sectionNumber, templateSlug) => {
        return (
            <div className="preview-section" key={section.id}>
                <div className="preview-section__label">
                    <span className="preview-section__num">{sectionNumber}</span>
                    <span className="preview-section__template-name">{templateSlug || 'unknown'}</span>
                </div>
                <div className="preview-section__body">
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        <p>Template: {section.template?.name || 'Unknown'}</p>
                        {section.fields && section.fields.length > 0 && (
                            <div style={{ marginTop: '16px' }}>
                                {section.fields.map(field => (
                                    <div key={field.id} style={{ marginBottom: '8px' }}>
                                        <strong>{field.name}:</strong> {field.value || '(empty)'}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="preview-layout">
                <div className="preview-topbar">
                    <div className="preview-topbar__info">
                        <span className="preview-topbar__badge">Preview</span>
                        <span className="preview-topbar__title">Loading...</span>
                    </div>
                    <button 
                        className="btn btn--ghost btn--sm"
                        onClick={() => navigate(`/builder?page=${pageSlug}`)}
                    >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 2L3 6.5 8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" />
                        </svg>
                        Back to Builder
                    </button>
                </div>
                <div className="preview-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                    Loading preview...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="preview-layout">
                <div className="preview-topbar">
                    <div className="preview-topbar__info">
                        <span className="preview-topbar__badge">Preview</span>
                        <span className="preview-topbar__title">Error</span>
                    </div>
                    <button 
                        className="btn btn--ghost btn--sm"
                        onClick={() => navigate(`/builder?page=${pageSlug}`)}
                    >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 2L3 6.5 8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" />
                        </svg>
                        Back to Builder
                    </button>
                </div>
                <div className="preview-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#dc2626' }}>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="preview-layout">
            <div className="preview-topbar">
                <div className="preview-topbar__info">
                    <span className="preview-topbar__badge">Preview</span>
                    <span className="preview-topbar__title">{pageData?.title || 'Untitled'}</span>
                    <span className="preview-topbar__slug">/{pageSlug}</span>
                </div>
                <button 
                    className="btn btn--ghost btn--sm"
                    onClick={() => navigate(`/builder?page=${pageSlug}`)}
                >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 2L3 6.5 8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" />
                    </svg>
                    Back to Builder
                </button>
            </div>

            <div className="preview-content">
                {sections.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        No sections yet. Add sections in the builder.
                    </div>
                ) : (
                    sections
                        .sort((a, b) => a.position - b.position)
                        .map((section, index) => renderSection(section, index))
                )}
            </div>
        </div>
    );
}