import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import CompanySetup from "./pages/CompanySetup";
import CompanyEditor from "./pages/CompanyEditor";
import CompanyPreview from "./pages/CompanyPreview";
import CareersPage from "./pages/CareersPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <CompanySetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/:slug/edit"
          element={
            <ProtectedRoute>
              <CompanyEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/:slug/preview"
          element={
            <ProtectedRoute>
              <CompanyPreview />
            </ProtectedRoute>
          }
        />
        <Route path="/:slug/careers" element={<CareersPage />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
