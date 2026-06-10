import './CaseViewer.css';

/**
 * Displays the current information package for inspection.
 */
export default function CaseViewer({ caseData, isTutorial }) {
    if (!caseData) return null;

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
            </div>
            <h2 className="case-viewer__headline">{caseData.headline}</h2>
            <p className="case-viewer__body">{caseData.body}</p>
            {isTutorial && caseData.hint && (
                <div className="case-viewer__hint">
                    <span className="case-viewer__hint-icon">►</span> {caseData.hint}
                </div>
            )}
        </div>
    );
}
