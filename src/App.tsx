import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./screens/authscreen/LoginPage";
import LoginSuccessPage from "./screens/authscreen/LoginSuccessPage";
import SignUpPage from "./screens/authscreen/SignUpPage";
import LandingPage from "./screens/pages/LandingPage";
import AIChat from "./screens/pages/AIChat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login-success" element={<LoginSuccessPage />} />
        <Route path="/oauth-callback" element={<LoginSuccessPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/chat" element={<AIChat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
