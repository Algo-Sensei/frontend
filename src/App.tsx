import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./screens/authscreen/LoginPage";
import SignUpPage from "./screens/authscreen/SignUpPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;