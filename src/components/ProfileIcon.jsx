import profileIcon from '../assets/icons/profile.webp';
import './ProfileIcon.css';

export default function ProfileIcon({ onClick }) {
    return (
        <button
            className="profile-icon"
            onClick={onClick}
            aria-label="Open profile"
            id="profile-icon"
        >
            <img src={profileIcon} alt="Profile" className="profile-icon__img" />
        </button>
    );
}
