import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, HOME_ROUTE } from '../utils/constants';
import RootLayout from '../layouts/RootLayout';

import Login from '../pages/auth/Login';

// Super Admin — full control (section 4 of the guide)
import SuperAdminDashboard from '../pages/super-admin/Dashboard';
import SuperAdminVehicles from '../pages/super-admin/Vehicles';
import SuperAdminSuppliers from '../pages/super-admin/Suppliers';
import SuperAdminCustomers from '../pages/super-admin/Customers';
import SuperAdminApplications from '../pages/super-admin/Applications';
import SuperAdminUsers from '../pages/super-admin/Users';
import SuperAdminReports from '../pages/super-admin/Reports';
import SuperAdminAuditLog from '../pages/super-admin/AuditLog';
import SuperAdminSettings from '../pages/super-admin/Settings';

// Admin — limited operational access (section 5)
import AdminDashboard from '../pages/admin/Dashboard';
import Cars from '../pages/admin/Cars';
import Suppliers from '../pages/admin/Suppliers';
import Customers from '../pages/admin/Customers';
import Applications from '../pages/admin/Applications';
import Reports from '../pages/admin/Reports';

// Manager — assigned customers only (section 6)
import ManagerDashboard from '../pages/manager/Dashboard';
import AssignedCustomers from '../pages/manager/AssignedCustomers';
import ApplicationWorkflow from '../pages/manager/ApplicationWorkflow';

// Customer — own data only (section 7)
import CustomerDashboard from '../pages/customer/Dashboard';
import Showroom from '../pages/customer/Showroom';
import CarDetails from '../pages/customer/CarDetails';
import ApplyForCar from '../pages/customer/ApplyForCar';
import MyApplications from '../pages/customer/MyApplications';
import ApplicationDetail from '../pages/customer/ApplicationDetail';
import Profile from '../pages/customer/Profile';
import Wishlist from '../pages/customer/Wishlist';
import Compare from '../pages/customer/Compare';
import Notifications from '../pages/customer/Notifications';

// Guards every private route: not logged in -> /login; logged in with
// the wrong role -> bounced to their own home (section 10, "Critical
// authorization rule" — this is UX only, the backend is the real gate).
function Guard({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={HOME_ROUTE[user.role] || '/login'} replace />;
  return <RootLayout>{children}</RootLayout>;
}

export default function AppRoutes() {
  const { user, initializing } = useAuth();
  if (initializing) return null;

  const home = user ? HOME_ROUTE[user.role] || '/login' : '/login';

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={home} /> : <Login />} />
      <Route path="/" element={<Navigate to={home} replace />} />

      {/* ── Super Admin ──────────────────────────────────────────── */}
      <Route path="/super-admin" element={<Guard roles={[ROLES.SUPER_ADMIN]}><SuperAdminDashboard /></Guard>} />
      <Route path="/super-admin/vehicles" element={<Guard roles={[ROLES.SUPER_ADMIN]}><SuperAdminVehicles /></Guard>} />
      <Route path="/super-admin/suppliers" element={<Guard roles={[ROLES.SUPER_ADMIN]}><SuperAdminSuppliers /></Guard>} />
      <Route path="/super-admin/customers" element={<Guard roles={[ROLES.SUPER_ADMIN]}><SuperAdminCustomers /></Guard>} />
      <Route path="/super-admin/applications" element={<Guard roles={[ROLES.SUPER_ADMIN]}><SuperAdminApplications /></Guard>} />
      <Route path="/super-admin/users" element={<Guard roles={[ROLES.SUPER_ADMIN]}><SuperAdminUsers /></Guard>} />
      <Route path="/super-admin/reports" element={<Guard roles={[ROLES.SUPER_ADMIN]}><SuperAdminReports /></Guard>} />
      <Route path="/super-admin/audit-log" element={<Guard roles={[ROLES.SUPER_ADMIN]}><SuperAdminAuditLog /></Guard>} />
      <Route path="/super-admin/settings" element={<Guard roles={[ROLES.SUPER_ADMIN]}><SuperAdminSettings /></Guard>} />

      {/* ── Admin ────────────────────────────────────────────────── */}
      <Route path="/admin" element={<Guard roles={[ROLES.ADMIN]}><AdminDashboard /></Guard>} />
      <Route path="/admin/cars" element={<Guard roles={[ROLES.ADMIN]}><Cars /></Guard>} />
      <Route path="/admin/suppliers" element={<Guard roles={[ROLES.ADMIN]}><Suppliers /></Guard>} />
      <Route path="/admin/customers" element={<Guard roles={[ROLES.ADMIN]}><Customers /></Guard>} />
      <Route path="/admin/applications" element={<Guard roles={[ROLES.ADMIN]}><Applications /></Guard>} />
      <Route path="/admin/reports" element={<Guard roles={[ROLES.ADMIN]}><Reports /></Guard>} />

      {/* ── Manager ──────────────────────────────────────────────── */}
      <Route path="/manager" element={<Guard roles={[ROLES.MANAGER]}><ManagerDashboard /></Guard>} />
      <Route path="/manager/customers" element={<Guard roles={[ROLES.MANAGER]}><AssignedCustomers /></Guard>} />
      <Route path="/manager/applications/:id" element={<Guard roles={[ROLES.MANAGER]}><ApplicationWorkflow /></Guard>} />

      {/* ── Customer ─────────────────────────────────────────────── */}
      <Route path="/customer" element={<Guard roles={[ROLES.CUSTOMER]}><CustomerDashboard /></Guard>} />
      <Route path="/customer/showroom" element={<Guard roles={[ROLES.CUSTOMER, ROLES.MANAGER]}><Showroom /></Guard>} />
      <Route path="/customer/cars/:id" element={<Guard roles={[ROLES.CUSTOMER, ROLES.MANAGER]}><CarDetails /></Guard>} />
      <Route path="/customer/apply/:id" element={<Guard roles={[ROLES.CUSTOMER]}><ApplyForCar /></Guard>} />
      <Route path="/customer/applications" element={<Guard roles={[ROLES.CUSTOMER]}><MyApplications /></Guard>} />
      <Route path="/customer/applications/:id" element={<Guard roles={[ROLES.CUSTOMER]}><ApplicationDetail /></Guard>} />
      <Route path="/customer/profile" element={<Guard roles={[ROLES.CUSTOMER]}><Profile /></Guard>} />
      <Route path="/customer/wishlist" element={<Guard roles={[ROLES.CUSTOMER]}><Wishlist /></Guard>} />
      <Route path="/customer/compare" element={<Guard roles={[ROLES.CUSTOMER]}><Compare /></Guard>} />
      <Route path="/customer/notifications" element={<Guard roles={[ROLES.CUSTOMER]}><Notifications /></Guard>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
