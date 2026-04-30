// Base URL for API calls
export const baseUrl = "https://super-awoof-d6b48f0a17a5.herokuapp.com/api/v1";

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

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
};

export const setUser = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user));
};
