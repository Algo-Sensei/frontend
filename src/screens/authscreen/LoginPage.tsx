import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const ChevronLeft = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
    <path d="M15 18l-6-6 6-6" stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BACKEND_URL = "http://localhost:8080";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if backend already has a session (returned from OAuth)
  useEffect(() => {
  const checkSession = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/session`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        navigate("/chat", { replace: true }); // ✅ only redirect if logged in
      }
    } catch (_) {
      // not logged in → stay on login page
    } finally {
      setCheckingAuth(false);
    }
  };

  checkSession();
}, [navigate]);

  const handleNavigate = (path: string) => {
    setLeaving(true);
    setTimeout(() => navigate(path), 400);
  };

  // Redirects to backend OAuth2 — backend handles the provider flow
  // and redirects back to /chat on success
  const handleOAuthLogin = (provider: "google" | "github") => {
    setOauthLoading(provider);
    window.location.href = `${BACKEND_URL}/oauth2/authorization/${provider}`;
  };

  // Email/password login via backend
  const handleEmailLogin = async () => {
    if (!email.trim()) return;
    setLoginError(null);
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        navigate("/chat", { replace: true });
      } else {
        const data = await res.json().catch(() => ({}));
        setLoginError((data as any)?.message || "Invalid email or password.");
      }
    } catch (_) {
      setLoginError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleEmailLogin();
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#242424", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "3px solid #444", borderTop: "3px solid #E24E40", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; background-color: #242424; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#242424",
          fontFamily: "'Inter', sans-serif",
          animation: leaving ? "fadeOut 0.4s ease forwards" : "fadeIn 0.4s ease",
          position: "relative",
        }}
      >
        {/* Back button */}
        <button
          onClick={() => handleNavigate("/")}
          style={{
            position: "absolute", top: "24px", left: "24px",
            background: "none", border: "none", cursor: "pointer",
            padding: "6px", borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#333")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          aria-label="Go back"
        >
          <ChevronLeft />
        </button>

        <div
          style={{
            display: "flex", flexDirection: "column",
            width: "100%", maxWidth: "400px",
            padding: "40px 32px", borderRadius: "12px",
            backgroundColor: "#242424",
          }}
        >
          <h2
            style={{
              fontSize: "27px", fontWeight: "700", color: "#FFFFFF",
              textAlign: "center", marginBottom: "28px",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Welcome to AlgoSensei!
          </h2>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              padding: "12px", borderRadius: "5px",
              border: "1px solid #555", color: "#FFFFFF",
              fontSize: "16px", backgroundColor: "#484848",
              outline: "none", fontFamily: "'Inter', sans-serif",
              marginBottom: "10px",
            }}
            onFocus={(e) => (e.currentTarget.style.border = "1px solid #E24E40")}
            onBlur={(e) => (e.currentTarget.style.border = "1px solid #555")}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              padding: "12px", borderRadius: "5px",
              border: "1px solid #555", color: "#FFFFFF",
              fontSize: "16px", backgroundColor: "#484848",
              outline: "none", fontFamily: "'Inter', sans-serif",
              marginBottom: "12px",
            }}
            onFocus={(e) => (e.currentTarget.style.border = "1px solid #E24E40")}
            onBlur={(e) => (e.currentTarget.style.border = "1px solid #555")}
          />

          {loginError && (
            <p style={{ color: "#E24E40", fontSize: "13px", marginBottom: "10px", fontFamily: "'Inter', sans-serif" }}>
              {loginError}
            </p>
          )}

          <button
            onClick={handleEmailLogin}
            disabled={loading || !email.trim()}
            style={{
              height: "48px", borderRadius: "5px", border: "none",
              backgroundColor: "#E24E40", color: "#fff",
              fontWeight: "600", fontSize: "16px",
              cursor: loading || !email.trim() ? "not-allowed" : "pointer",
              fontFamily: "'Inter', sans-serif", marginBottom: "16px",
              transition: "background-color 0.2s",
              opacity: loading || !email.trim() ? 0.6 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
            onMouseEnter={(e) => { if (!loading && email.trim()) e.currentTarget.style.backgroundColor = "#c94030"; }}
            onMouseLeave={(e) => { if (!loading && email.trim()) e.currentTarget.style.backgroundColor = "#E24E40"; }}
          >
            {loading
              ? <div style={{ width: 18, height: 18, border: "2px solid #ffffff55", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              : "Login"
            }
          </button>

          <div style={{ color: "#FFFFFF", fontSize: "12px", fontFamily: "'Inter', sans-serif", marginBottom: "20px" }}>
            Don't have an account?{" "}
            <span
              style={{ color: "#D9D9D9", fontStyle: "italic", cursor: "pointer", userSelect: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#D9D9D9")}
              onClick={() => handleNavigate("/signup")}
            >
              Sign up
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#555" }} />
            <span style={{ color: "#999", fontSize: "12px", letterSpacing: "1px", fontFamily: "'Inter', sans-serif" }}>OR</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#555" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(
              [
                { label: "Continue with Google", icon: <GoogleIcon />, provider: "google" as const },
                { label: "Continue with GitHub", icon: <GitHubIcon />, provider: "github" as const },
              ] as const
            ).map(({ label, icon, provider }) => (
              <button
                key={label}
                onClick={() => handleOAuthLogin(provider)}
                disabled={oauthLoading !== null}
                style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  padding: "12px 16px", height: "52px",
                  borderRadius: "8px", border: "1px solid #555",
                  backgroundColor: "#2E2E2E", color: "#FFFFFF",
                  fontSize: "15px",
                  cursor: oauthLoading !== null ? "not-allowed" : "pointer",
                  fontFamily: "'Inter', sans-serif", width: "100%",
                  transition: "background-color 0.2s",
                  opacity: oauthLoading !== null ? 0.6 : 1,
                }}
                onMouseEnter={(e) => { if (!oauthLoading) e.currentTarget.style.backgroundColor = "#3d3d3d"; }}
                onMouseLeave={(e) => { if (!oauthLoading) e.currentTarget.style.backgroundColor = "#2E2E2E"; }}
              >
                <span style={{ width: "24px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
                  {oauthLoading === provider
                    ? <div style={{ width: 18, height: 18, border: "2px solid #555", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    : icon
                  }
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;