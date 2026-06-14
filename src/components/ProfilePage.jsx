import { useState } from 'react';
import { PROFILE_AVATARS } from '../data/profileAvatars';
import { formatAgentTag, sanitizeAgentName } from '../utils/agentIdentity';
import './ProfilePage.css';

export default function ProfilePage({ agentName, agentId, avatarId, onSave, onClose }) {
    const [draftName, setDraftName] = useState(agentName || '');
    const [draftAvatarId, setDraftAvatarId] = useState(avatarId || PROFILE_AVATARS[0].id);

    const cleanName = sanitizeAgentName(draftName);
    const canSave = cleanName.length > 0;

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!canSave) return;
        onSave?.({ name: cleanName, avatarId: draftAvatarId });
    };

    return (
        <div className="profile-page">
            <form className="profile-page__panel" onSubmit={handleSubmit}>
                <div className="profile-page__header">
                    <span>PROFILE</span>
                    <button type="button" onClick={onClose} aria-label="Close profile">[ X ]</button>
                </div>

                <label className="profile-page__field">
                    <span>Nickname</span>
                    <input
                        type="text"
                        value={draftName}
                        maxLength={24}
                        onChange={event => setDraftName(event.target.value)}
                    />
                </label>

                <label className="profile-page__field">
                    <span>Locked ID</span>
                    <input type="text" value={agentId || '#000000'} readOnly />
                </label>

                <div className="profile-page__avatars" role="radiogroup" aria-label="Choose profile icon">
                    <span>Profile icon</span>
                    <div className="profile-page__avatar-grid">
                        {PROFILE_AVATARS.map(avatar => (
                            <button
                                key={avatar.id}
                                type="button"
                                className={`profile-page__avatar ${draftAvatarId === avatar.id ? 'profile-page__avatar--active' : ''}`}
                                onClick={() => setDraftAvatarId(avatar.id)}
                                role="radio"
                                aria-checked={draftAvatarId === avatar.id}
                                aria-label={avatar.label}
                            >
                                <img src={avatar.src} alt="" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="profile-page__tag">
                    <span>Visible tag</span>
                    <strong>{formatAgentTag(cleanName || agentName, agentId)}</strong>
                </div>

                <div className="profile-page__actions">
                    <button type="button" onClick={onClose}>[ CANCEL ]</button>
                    <button type="submit" disabled={!canSave}>[ SAVE ]</button>
                </div>
            </form>
        </div>
    );
}
