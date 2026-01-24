import nookies from "nookies";

// Constants
export const ACCESS_TOKEN_KEY = "inventory-auth-token";
export const REFRESH_TOKEN_KEY = "inventory-refresh-token";



// Base cookie options
const secure = process.env.NODE_ENV === "production";
const baseCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure,
};

/**
 * Sets access and refresh tokens in cookies.
 * @param accessToken - Access token string
 * @param refreshToken - Refresh token string
 */
export const setAuthTokenPair = (
  accessToken: string = "",
  refreshToken: string = "",
  refreshTokenExpires: string = ""
) => {
  nookies.set(null, ACCESS_TOKEN_KEY, accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60, // 24 hrs
  });

   // Refresh token (derived from ISO expiry)
   if (refreshToken && refreshTokenExpires) {
    nookies.set(null, REFRESH_TOKEN_KEY, refreshToken, {
      ...baseCookieOptions,
      maxAge: getMaxAgeFromISO(refreshTokenExpires),
    });
  }
};


/**
 * Deletes all auth-related tokens from cookies.
 */
export const deleteTokenPair = () => {
  nookies.destroy(null, ACCESS_TOKEN_KEY, { path: "/" });
  nookies.destroy(null, REFRESH_TOKEN_KEY, { path: "/" });
};

/**
 * Retrieves access token from cookies.
 */
export const getAccessToken = (): string | undefined => {
  const cookies = nookies.get();
  return cookies[ACCESS_TOKEN_KEY] ?? null;
};

/**
 * Retrieves refresh token from cookies.
 */
export const getRefreshToken = (): string | undefined => {
  const cookies = nookies.get();
  return cookies[REFRESH_TOKEN_KEY] ?? null;
};


/**
 * Deletes only the refresh token cookie.
 */
export const deleteRefreshTokenCookie = () => {
  nookies.destroy(null, REFRESH_TOKEN_KEY, { path: "/" });
};




/**
 * Convert ISO date string to maxAge in seconds
 */
const getMaxAgeFromISO = (isoDate: string): number => {
    const expiresAt = new Date(isoDate).getTime();
    const now = Date.now();
  
    const diffInSeconds = Math.floor((expiresAt - now) / 1000);
  
    // Prevent negative or invalid maxAge
    return diffInSeconds > 0 ? diffInSeconds : 0;
  };