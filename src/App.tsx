// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./screens/pages/LandingPage"; // ✅ match the actual component name & file


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />   {/* ✅ route added */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;