    import React, { useState } from "react";
    import { useNavigate } from "react-router-dom";

    const GoogleIcon = () => (
    <svg width="22" height="22" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
    );

    const MicrosoftIcon = () => (
    <svg width="22" height="22" viewBox="0 0 21 21">
        <rect x="1"  y="1"  width="9" height="9" fill="#F25022"/>
        <rect x="11" y="1"  width="9" height="9" fill="#7FBA00"/>
        <rect x="1"  y="11" width="9" height="9" fill="#00A4EF"/>
        <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
    );

    const AppleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
    );

    const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [leaving, setLeaving] = useState(false);


    // navigate to signup
    const handleNavigate = (path: string) => {
        setLeaving(true);
        setTimeout(() => navigate(path), 400);
    };

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
            }}
        >
            <div
            style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                maxWidth: "400px",
                padding: "40px 32px",
                borderRadius: "12px",
                backgroundColor: "#242424",
            }}
            >
            <h2
                style={{
                fontSize: "27px",
                fontWeight: "700",
                color: "#FFFFFF",
                textAlign: "center",
                marginBottom: "28px",
                fontFamily: "'Inter', sans-serif",
                }}
            >
                Welcome to AlgoSensei!
            </h2>

            <input
                type="text"
                placeholder="Email address"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                padding: "12px",
                borderRadius: "5px",
                border: "1px solid #555",
                color: "#FFFFFF",
                fontSize: "16px",
                backgroundColor: "#484848",
                outline: "none",
                fontFamily: "'Inter', sans-serif",
                marginBottom: "12px",
                }}
                onFocus={(e) => (e.currentTarget.style.border = "1px solid #E24E40")}
                onBlur={(e) => (e.currentTarget.style.border = "1px solid #555")}
            />

            <button
                style={{
                height: "48px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: "#E24E40",
                color: "#fff",
                fontWeight: "600",
                fontSize: "16px",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                marginBottom: "16px",
                transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c94030")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E24E40")}
                // todo to direct ai chat
            >
                Login
            </button>

            <div style={{ color: "#FFFFFF", fontSize: "12px", fontFamily: "'Inter', sans-serif", marginBottom: "20px" }}>
                Don't have an account?{" "}
                <span
                style={{
                    color: "#D9D9D9",
                    fontStyle: "italic",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "color 0.2s",
                }}
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
                {[
                { label: "Continue with Google",            icon: <GoogleIcon />,    onClick: () => alert("Google login") },
                { label: "Continue with Microsoft Account", icon: <MicrosoftIcon />, onClick: () => alert("Microsoft login") },
                { label: "Continue with Apple",             icon: <AppleIcon />,     onClick: () => alert("Apple login") },
                ].map(({ label, icon, onClick }) => (
                <button
                    key={label}
                    onClick={onClick}
                    style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "12px 16px",
                    height: "52px",
                    borderRadius: "8px",
                    border: "1px solid #555",
                    backgroundColor: "#2E2E2E",
                    color: "#FFFFFF",
                    fontSize: "15px",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                    width: "100%",
                    transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3d3d3d")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2E2E2E")}
                >
                    <span style={{ width: "24px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
                    {icon}
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