// Base URL for API calls
export const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.superawoof.ng/api/v1";

// Token helpers (localStorage for web)
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

/**
 * Clears the session and everything personal alongside it.
 *
 * The bank beneficiary in particular held a full name and account number and
 * survived sign-out indefinitely, which is a problem on the shared and
 * borrowed handsets a lot of this audience uses.
 */
export const clearTokens = () => {
  [
    "accessToken",
    "refreshToken",
    "user",
    "lastBeneficiary",
    "pendingPhone",
    "pendingEmail",
    "isNewAccount",
    "verifyEndpoint",
    "subscribeFullName",
    "subscribePhone",
    "subscribeTrxId",
  ].forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable; nothing was stored to begin with.
    }
  });
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
};

export const setUser = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user));
};
