// Contract of CLAUDE.md §10: GET /me and POST /diners/me.

export type UserRole = 'restaurant_admin' | 'diner';

/** GET /me (both roles) and the answer of POST /diners/me. */
export interface Me {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  restaurantId: string | null;
}

/** Body of POST /diners/me: `displayName` 1–60 characters; without it the backend uses the Google name or the email. */
export interface CreateDinerProfileInput {
  displayName?: string;
}

export interface AccountApi {
  getMe(): Promise<Me>;
  createDinerProfile(input: CreateDinerProfileInput): Promise<Me>;
}
