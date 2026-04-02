import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./screens/authscreen/LoginPage";
import SignUpPage from "./screens/authscreen/SignUpPage";
import LandingPage from "./screens/LandingPage";
import AIChat from "./screens/pages/AIChat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/chat" element={<AIChat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;