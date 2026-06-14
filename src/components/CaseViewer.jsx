import './CaseViewer.css';

const caseImages = import.meta.glob('../assets/cases/**/*.{webp,png,jpg,jpeg}', {
    eager: true,
    import: 'default',
});

function getCaseImageSrc(imagePath) {
    if (!imagePath) return null;
    const normalizedPath = imagePath.replaceAll('\\', '/');
    const matchKey = Object.keys(caseImages).find(key => key.endsWith(`/cases/${normalizedPath}`));
    return matchKey ? caseImages[matchKey] : null;
}

/**
 * Displays the current information package for inspection.
 */
export default function CaseViewer({ caseData, isTutorial }) {
    if (!caseData) return null;
    const hasEvidence = Array.isArray(caseData.evidence) && caseData.evidence.length > 0;
    const hasRedFlags = Array.isArray(caseData.redFlags) && caseData.redFlags.length > 0;
    const imageSrc = getCaseImageSrc(caseData.image);

    return (
        <div className="case-viewer" id="case-viewer">
            {isTutorial && (
                <div className="case-viewer__tutorial-badge">⚙ TRAINING PACKAGE</div>
            )}
            <div className="case-viewer__header">
                <span className="case-viewer__source">{caseData.source}</span>
                {caseData.mediaTag && (
                    <span className="case-viewer__media-tag">[{caseData.mediaTag}]</span>
                )}
                {caseData.category && (
                    <span className="case-viewer__media-tag">[{caseData.category.toUpperCase()}]</span>
                )}
            </div>
            <h2 className="case-viewer__headline">{caseData.headline}</h2>
            {caseData.publishedContext && (
                <div className="case-viewer__context" style={{ color: '#828282', fontSize: '15px', marginBottom: '12px' }}>
                    DATE: {caseData.publishedContext}
                </div>
            )}
            {imageSrc && (
                <figure className="case-viewer__media">
                    <img src={imageSrc} alt="" className="case-viewer__image" />
                    <figcaption className="case-viewer__caption">SUBMITTED IMAGE EVIDENCE</figcaption>
                </figure>
            )}
            <p className="case-viewer__body">{caseData.body}</p>
            {hasEvidence && (
                <section className="case-viewer__dossier" aria-label="Evidence dossier">
                    <div className="case-viewer__section-title">EVIDENCE DOSSIER</div>
                    <div className="case-viewer__evidence-list">
                        {caseData.evidence.map((item, index) => (
                            <article className="case-viewer__evidence" key={`${item.title}-${index}`}>
                                <div className="case-viewer__evidence-header">
                                    <span className="case-viewer__evidence-title">{item.title}</span>
                                    <span className="case-viewer__evidence-type">{item.type}</span>
                                </div>
                                {item.detail && (
                                    <p className="case-viewer__evidence-detail">{item.detail}</p>
                                )}
                            </article>
                        ))}
                    </div>
                </section>
            )}
            {hasRedFlags && (
                <section className="case-viewer__flags" aria-label="Analysis flags">
                    <div className="case-viewer__section-title">ANALYSIS FLAGS</div>
                    <div className="case-viewer__flag-list">
                        {caseData.redFlags.map(flag => (
                            <span className="case-viewer__flag" key={flag}>{flag.replaceAll('_', ' ')}</span>
                        ))}
                    </div>
                </section>
            )}
            {isTutorial && caseData.hint && (
                <div className="case-viewer__hint">
                    <span className="case-viewer__hint-icon">►</span> {caseData.hint}
                </div>
            )}
        </div>
    );
}
