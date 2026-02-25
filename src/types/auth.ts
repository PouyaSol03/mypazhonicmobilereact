/**
 * User fields we use in the app (from bridge getLatestUser / login).
 * Only includes what we display or need; password is never exposed.
 */
export type UserInfo = {
  userName?: string
  phoneNumber?: string
  fullName?: string
  firstName?: string
  lastName?: string
  nationalCode?: string
  avatarUrl?: string
}

/** Normalize bridge user (Record<string, unknown>) to UserInfo. */
export function toUserInfo(u: Record<string, unknown> | null | undefined): UserInfo | null {
  if (!u || typeof u !== 'object') return null
  return {
    userName: typeof u.userName === 'string' ? u.userName : undefined,
    phoneNumber: typeof u.phoneNumber === 'string' ? u.phoneNumber : undefined,
    fullName: typeof u.fullName === 'string' ? u.fullName : undefined,
    firstName: typeof u.firstName === 'string' ? u.firstName : undefined,
    lastName: typeof u.lastName === 'string' ? u.lastName : undefined,
    nationalCode: typeof u.nationalCode === 'string' ? u.nationalCode : undefined,
    avatarUrl: typeof u.avatarUrl === 'string' ? u.avatarUrl : undefined,
  }
}
