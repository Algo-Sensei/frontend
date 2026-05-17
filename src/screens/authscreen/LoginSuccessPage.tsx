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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#242424",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          border: "3px solid #444",
          borderTop: "3px solid #E24E40",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
