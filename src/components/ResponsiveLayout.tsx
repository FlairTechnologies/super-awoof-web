"use client";
import React, { useState, useEffect } from "react";
import { SideNav } from "./SideNav";
import { TabBar } from "./TabBar";
import { usePathname, useRouter } from "next/navigation";
import { getUser, getAccessToken, clearTokens, baseUrl, setTokens } from "@/lib/constants";
import { useToast } from "@/context/ToastContext";
import axios from "axios";

export const ResponsiveLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isShell = pathname === "/" || pathname.startsWith("/onboarding") || pathname.startsWith("/auth");

  // 1. Axios interceptor and auth verification
  useEffect(() => {
    // Request Interceptor: Auto attach Bearer token
    const reqInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = getAccessToken();
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Auto refresh token on 401
    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            try {
              const res = await axios.post(`${baseUrl}/account/refresh-token`, { refreshToken });
              if (res.status === 200) {
                const { accessToken, refreshToken: newRefreshToken } = res.data;
                setTokens(accessToken, newRefreshToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axios(originalRequest);
              }
            } catch (refreshError) {
              clearTokens();
              localStorage.removeItem("loginTimestamp");
              showToast("Session expired. Please log in again.", "error");
              router.push("/auth/signin");
            }
          } else {
            clearTokens();
            localStorage.removeItem("loginTimestamp");
            router.push("/auth/signin");
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, [router, showToast]);

  // 2. Auth Guard and Persistent Session Check
  useEffect(() => {
    const checkAuthAndSession = () => {
      const token = getAccessToken();
      const u = getUser();

      // If user is on an auth or onboarding shell route, but ALREADY has a valid session, auto-redirect to dashboard
      if (isShell) {
        if (token && u && (pathname.startsWith("/auth") || pathname.startsWith("/onboarding"))) {
          router.push("/dashboard");
          return;
        }
        setCheckingAuth(false);
        return;
      }

      // Route Guard for protected dashboard pages
      if (!token || !u) {
        clearTokens();
        localStorage.removeItem("loginTimestamp");
        router.push("/auth/signin");
        return;
      }

      setCheckingAuth(false);
    };

    checkAuthAndSession();
  }, [isShell, pathname, router]);

  if (checkingAuth && !isShell) {
    return (
      <div style={{ height: "100dvh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center" }} className="bg-[#0D0F14]">
        <div className="spinner" />
      </div>
    );
  }

  if (isShell) {
    // Auth & onboarding: full-screen, no nav
    return (
      <div style={{ height: "100dvh", width: "100vw", overflow: "hidden" }} className="bg-[#0D0F14]">
        {children}
      </div>
    );
  }

  // Dashboard app shell: sidebar on desktop, tab bar on mobile
  return (
    <div className="flex bg-[#0D0F14]" style={{ height: "100dvh", width: "100vw", overflow: "hidden" }}>
      <SideNav />
      <main className="flex-1 overflow-y-auto" style={{ height: "100dvh" }}>
        {children}
      </main>
      <div className="md:hidden" style={{ position: "absolute" }}>
        {/* Flair Technologies Credit — mobile only */}
        <a
          href="https://www.flairtechlabs.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 90,
            display: "block",
            textAlign: "center",
            fontSize: 9,
            color: "var(--muted)",
            opacity: 0.45,
            padding: "4px 0",
            textDecoration: "none",
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            letterSpacing: "0.03em",
          }}
        >
          Built by <strong style={{ color: "var(--green)", fontWeight: 700 }}>Flair Technologies Limited</strong>
        </a>
        <TabBar />
      </div>
    </div>
  );
};
