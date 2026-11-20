import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/common/PrivateRoute'
import BorrowerLayout from './components/layout/BorrowerLayout'
import AdminLayout from './components/layout/AdminLayout'
import LandingPage from './pages/LandingPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import BorrowerDashboard from './pages/borrower/BorrowerDashboard'
import MyLoans from './pages/borrower/MyLoans'
import ApplyLoan from './pages/borrower/ApplyLoan'
import PayEmi from './pages/borrower/PayEmi'
import CreditScore from './pages/borrower/CreditScore'
import Notifications from './pages/borrower/Notifications'
import PaymentHistory from './pages/borrower/PaymentHistory'
import AdminDashboard from './pages/admin/AdminDashboard'
import PendingLoans from './pages/admin/PendingLoans'
import Analytics from './pages/admin/Analytics'
import FraudChecks from './pages/admin/FraudChecks'
import Reports from './pages/admin/Reports'
import AgentDashboard from './pages/agent/AgentDashboard'
import { ROLES } from './utils/constants'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Borrower — protected */}
      <Route element={<PrivateRoute roles={[ROLES.BORROWER]} />}>
        <Route path="/borrower" element={<BorrowerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<BorrowerDashboard />} />
          <Route path="loans" element={<MyLoans />} />
          <Route path="loans/apply" element={<ApplyLoan />} />
          <Route path="pay-emi" element={<PayEmi />} />
          <Route path="credit" element={<CreditScore />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="payments" element={<PaymentHistory />} />
        </Route>
      </Route>

      {/* Admin — protected */}
      <Route element={<PrivateRoute roles={[ROLES.ADMIN]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="loans" element={<PendingLoans />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="fraud" element={<FraudChecks />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Route>

      {/* Agent — protected */}
      <Route element={<PrivateRoute roles={[ROLES.AGENT]} />}>
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
