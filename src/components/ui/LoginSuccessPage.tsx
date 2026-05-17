import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchCurrentUser, fetchLoginSession } from "../../api";

export default function LoginSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loginStatus = searchParams.get("login");

    if (loginStatus === "success") {
      const resumeSession = async () => {
        const user = await fetchCurrentUser().catch(() => null);
        navigate(user ? "/chat" : "/login", { replace: true });
      };

      void resumeSession();
      return;
    }

    const checkSession = async () => {
      try {
        const isLoggedIn = await fetchLoginSession();
        if (isLoggedIn) {
          navigate("/chat", { replace: true });
          return;
        }
      } catch (_) {
        // Fall back to the login screen if the backend check fails.
      }

      navigate("/login", { replace: true });
    };

    void checkSession();
  }, [navigate, searchParams]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body, #root { height: 100%; width: 100%; background-color: #242424; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#242424",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "40px 32px",
            borderRadius: "16px",
            backgroundColor: "#2E2E2E",
            border: "1px solid #3A3A3A",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            animation: "fadeIn 0.35s ease",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              marginBottom: "20px",
              border: "4px solid #4A4A4A",
              borderTop: "4px solid #E24E40",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />

          <h1
            style={{
              color: "#FFFFFF",
              fontSize: "28px",
              fontWeight: 700,
              margin: "0 0 12px",
            }}
          >
            Signing you in
          </h1>

          <p
            style={{
              color: "#BDBDBD",
              fontSize: "15px",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Please wait while we restore your session and take you to your workspace.
          </p>
        </div>
      </div>
    </>
  );
}
