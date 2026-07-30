import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { VoteProvider } from './context/VoteContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import StaffRoute from './components/StaffRoute';
import FloatingContact from './components/FloatingContact';
import EventsBanner from './components/EventsBanner';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Proof from './pages/Proof';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminLayout from './pages/admin/AdminLayout';
import GiftVotes from './pages/admin/GiftVotes';
import RedeemCodes from './pages/admin/RedeemCodes';
import History from './pages/admin/History';

function AppRoutes() {
  const { user } = useAuth();

  // Wrap authenticated content in VoteProvider
  const withVotes = (component) => (
    <ProtectedRoute>
      <VoteProvider>{component}</VoteProvider>
    </ProtectedRoute>
  );

  return (
    <>
      <EventsBanner />
      <Navbar />
      <FloatingContact />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={user ? <VoteProvider><Pricing /></VoteProvider> : <Pricing />} />
        <Route path="/proof" element={<Proof />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={withVotes(<Dashboard />)} />
        <Route path="/profile" element={withVotes(<Profile />)} />
        <Route
          path="/admin"
          element={
            <StaffRoute>
              <AdminLayout />
            </StaffRoute>
          }
        >
          <Route index element={<Navigate to="/admin/gift" replace />} />
          <Route path="gift" element={<GiftVotes />} />
          <Route path="codes" element={<RedeemCodes />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return <AppRoutes />;
}
