import directives from '../data/directives.json';
import './DirectivePanel.css';

/**
 * Sidebar showing active Ministry directives for the current day.
 */
export default function DirectivePanel({ day }) {
    const activeDirectives = directives.filter(d => d.day <= day);

    return (
        <div className="directive-panel" id="directive-panel">
            <label className="directive-panel__title">ACTIVE DIRECTIVES</label>
            <div className="directive-panel__list">
                {activeDirectives.map(dir => (
                    <div key={dir.id} className="directive-item">
                        <div className="directive-item__title">{dir.title}</div>
                        <div className="directive-item__text">{dir.text}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
