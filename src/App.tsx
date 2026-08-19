import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/login";
import ChiefWarden from "./chief-warden/chief-warden";
import Warden from "./warden/warden";
import AdminLayout from "./attendant/AdminLayout";
import PendingPage from "./attendant/PendingPage";
import ApprovedPage from "./attendant/ApprovedPage";
import RejectedPage from "./attendant/RejectedPage";
import "./App.css";

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const userStr = localStorage.getItem("user");
  const role = localStorage.getItem("role")?.toLowerCase();

  if (!userStr || !role) {
    return <Navigate to="/login" replace />;
  }

  // Handle variations in role naming from the backend
  const normalizedRole = role === "chief warden" ? "chief-warden" : role === "attendent" ? "attendant" : role;

  if (!allowedRoles.includes(normalizedRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Redirect already logged-in authority users away from the login page
function PublicRoute({ children }: { children: React.ReactNode }) {
  const userStr = localStorage.getItem("user");
  const role = localStorage.getItem("role")?.toLowerCase();

  if (userStr && role) {
    const normalized = role === "chief warden" ? "chief-warden" : role === "attendent" ? "attendant" : role;
    if (["chief-warden", "warden", "attendant"].includes(normalized)) {
      return <Navigate to={`/${normalized}`} replace />;
    }
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        
        {/* CHIEF WARDEN */}
        <Route path="/chief-warden" element={
          <ProtectedRoute allowedRoles={["chief-warden"]}>
            <ChiefWarden />
          </ProtectedRoute>
        } />
        
        {/* WARDEN */}
        <Route path="/warden" element={
          <ProtectedRoute allowedRoles={["warden"]}>
            <Warden />
          </ProtectedRoute>
        } />
        
        {/* ATTENDANT (Nested Routes) */}
        <Route path="/attendant" element={
          <ProtectedRoute allowedRoles={["attendant"]}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          {/* Default to pending page */}
          <Route index element={<PendingPage />} />
          <Route path="pending" element={<PendingPage />} />
          <Route path="approved" element={<ApprovedPage />} />
          <Route path="rejected" element={<RejectedPage />} />
        </Route>

        {/* Redirect root based on user status (if logged in, else login) */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
