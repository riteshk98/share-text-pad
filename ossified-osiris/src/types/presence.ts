export interface PresenceUser {
  name: string;
  color: string;
}

export interface PresenceState {
  users: PresenceUser[];
  message: string | null;
}
