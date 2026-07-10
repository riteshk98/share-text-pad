import type { PresenceUser } from '../types/presence';

const SESSION_KEY = 'share-text-pad:presence-user';
const NAME_KEY = 'share-text-pad:user-name';

const userNames = [
  'Anonymous Fox',
  'Blue Panda',
  'Green Tiger',
  'Orange Hawk',
  'Silver Lynx',
  'Crimson Otter',
  'Golden Wolf',
  'Purple Raven',
];

const colorPalette = [
  '#2563eb',
  '#16a34a',
  '#f97316',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#d97706',
  '#475569',
];

const randomItem = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)] as T;

/** Persist the user's chosen display name across sessions. */
export const saveUserName = (name: string): void => {
  if (typeof window === 'undefined') return;
  const trimmed = name.trim();
  if (trimmed) {
    window.localStorage.setItem(NAME_KEY, trimmed);
  } else {
    window.localStorage.removeItem(NAME_KEY);
  }
  // Clear the session cache so the new name is picked up immediately.
  window.sessionStorage.removeItem(SESSION_KEY);
};

/** Read back the name the user saved (empty string if none). */
export const getSavedUserName = (): string => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(NAME_KEY) ?? '';
};

export const getPresenceUser = (): PresenceUser => {
  if (typeof window === 'undefined') {
    return { name: 'Anonymous Fox', color: '#2563eb' };
  }

  const cached = window.sessionStorage.getItem(SESSION_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as PresenceUser;
      if (parsed.name && parsed.color) {
        return parsed;
      }
    } catch {
      // Ignore invalid cache values.
    }
  }

  const savedName = window.localStorage.getItem(NAME_KEY)?.trim();
  const generated: PresenceUser = {
    name: savedName || randomItem(userNames),
    color: randomItem(colorPalette),
  };

  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(generated));
  return generated;
};
