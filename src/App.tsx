import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./screens/authscreen/LoginPage";
import SignUpPage from "./screens/authscreen/SignUpPage";
import LandingPage from "./screens/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;