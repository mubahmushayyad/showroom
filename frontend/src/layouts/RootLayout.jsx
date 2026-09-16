import { Box, Drawer, Alert } from '@mui/material';
import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import ClientTopbar from '../components/layout/ClientTopbar';
import ClientFooter from '../components/layout/ClientFooter';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { clientColors } from '../theme/theme';

// Shown across every page whenever AppContext couldn't reach the API
// (see context/AppContext.jsx -> refresh()) — e.g. the backend isn't
// running yet, or VITE_API_URL in .env points somewhere unreachable.
function ApiErrorBanner() {
  const { loadError } = useApp() || {};
  if (!loadError) return null;
  return (
    <Alert severity="error" sx={{ borderRadius: 0 }}>
      {loadError}
    </Alert>
  );
}

export default function RootLayout({ children }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  if (user?.role === 'Customer') {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: clientColors.bg, display: 'flex', flexDirection: 'column' }}>
        <ApiErrorBanner />
        <ClientTopbar />
        <Box component="main" sx={{ flex: 1 }}>
          {children}
        </Box>
        <ClientFooter />
      </Box>
    );
  }

  const items =
    user?.role === 'Manager'
      ? [
          { label: 'Dashboard', path: '/manager' },
          { label: 'Assigned Customers', path: '/manager/customers' },
          { label: 'Showroom', path: '/customer/showroom' },
        ]
      : user?.role === 'Super Admin'
      ? [
          { label: 'Dashboard', path: '/super-admin' },
          { label: 'Vehicles', path: '/super-admin/vehicles' },
          { label: 'Suppliers', path: '/super-admin/suppliers' },
          { label: 'Customers', path: '/super-admin/customers' },
          { label: 'Applications', path: '/super-admin/applications' },
          { label: 'Users', path: '/super-admin/users' },
          { label: 'Reports', path: '/super-admin/reports' },
          { label: 'Audit Log', path: '/super-admin/audit-log' },
          { label: 'Settings', path: '/super-admin/settings' },
        ]
      : [
          { label: 'Dashboard', path: '/admin' },
          { label: 'Vehicles', path: '/admin/cars' },
          { label: 'Suppliers', path: '/admin/suppliers' },
          { label: 'Customers', path: '/admin/customers' },
          { label: 'Applications', path: '/admin/applications' },
          { label: 'Reports', path: '/admin/reports' },
        ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ width: 250, display: { xs: 'none', md: 'block' }, borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Sidebar items={items} />
      </Box>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 250 }}>
          <Sidebar items={items} onNavigate={() => setOpen(false)} />
        </Box>
      </Drawer>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <ApiErrorBanner />
        <Topbar onMenu={() => setOpen(true)} />
        <Box component="main" sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, mx: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
