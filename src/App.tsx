import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/login";
import ChiefWarden from "./chief-warden/chief-warden";
import Warden from "./warden/warden";
import AdminLayout from "./attendant/AdminLayout";
import PendingPage from "./attendant/PendingPage";
import ApprovedPage from "./attendant/ApprovedPage";
import RejectedPage from "./attendant/RejectedPage";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<Login />} />
        
        {/* CHIEF WARDEN */}
        <Route path="/chief-warden" element={<ChiefWarden />} />
        
        {/* WARDEN */}
        <Route path="/warden" element={<Warden />} />
        
        {/* ATTENDANT (Nested Routes) */}
        <Route path="/attendant" element={<AdminLayout />}>
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
