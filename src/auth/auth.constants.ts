export const ACCESS_TOKEN_EXPIRES_IN = '15m';

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax', // Set to 'strict' in prod
    maxAge: 15 * 60 * 1000, // 15 minutes
}
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax', // Set to 'strict' in prod
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
}