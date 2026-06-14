import userIcon from '../assets/leaderboard/user.webp';
import female1 from '../assets/profile/female_1.webp';
import female2 from '../assets/profile/female_2.webp';
import female3 from '../assets/profile/female_3.webp';
import male1 from '../assets/profile/male_1.webp';
import male2 from '../assets/profile/male_2.webp';
import male3 from '../assets/profile/male_3.webp';

export const PROFILE_AVATARS = [
    { id: 'user', label: 'No icon', src: userIcon },
    { id: 'female_1', label: 'Profile 1', src: female1 },
    { id: 'female_2', label: 'Profile 2', src: female2 },
    { id: 'female_3', label: 'Profile 3', src: female3 },
    { id: 'male_1', label: 'Profile 4', src: male1 },
    { id: 'male_2', label: 'Profile 5', src: male2 },
    { id: 'male_3', label: 'Profile 6', src: male3 },
];

export const DEFAULT_PROFILE_AVATAR_ID = PROFILE_AVATARS[0].id;

export function getProfileAvatar(id) {
    return PROFILE_AVATARS.find(avatar => avatar.id === id) || PROFILE_AVATARS[0];
}
