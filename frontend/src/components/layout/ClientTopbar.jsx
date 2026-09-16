import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { clientColors } from '../../theme/theme';

const NAV_ITEMS = [
  { label: 'Home', path: '/customer' },
  { label: 'Vehicles', path: '/customer/showroom' },
  { label: 'Applications', path: '/customer/applications' },
  { label: 'Wishlist', path: '/customer/wishlist' },
  { label: 'Compare', path: '/customer/compare' },
];

export default function ClientTopbar() {
  const { user, logout } = useAuth();
  const { notifications, markRead } = useApp();
  const nav = useNavigate();
  const [accountAnchor, setAccountAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const mine = notifications.filter((x) => !x.userId || x.userId === user?.id);
  const unread = mine.filter((x) => !x.read).length;

  const linkSx = ({ isActive }) => ({
    color: isActive ? clientColors.accent : clientColors.text,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
    padding: '8px 4px',
    borderBottom: isActive ? `2px solid ${clientColors.accent}` : '2px solid transparent',
    transition: 'color .15s ease',
  });

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(16,11,8,0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${clientColors.border}`,
        }}
      >
        <Toolbar sx={{ maxWidth: 1400, width: '100%', mx: 'auto', gap: 2, py: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ cursor: 'pointer' }}
            onClick={() => nav('/customer')}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                bgcolor: clientColors.accent,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <DirectionsCarFilledRoundedIcon sx={{ color: '#1A1108', fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 18, letterSpacing: '0.01em' }}>
              U DEVS
              <Box component="span" sx={{ color: clientColors.textMuted, fontWeight: 500, fontSize: 10, fontFamily: 'Inter, sans-serif', display: 'block', letterSpacing: '0.14em', lineHeight: 1.4 }}>
                CAR SHOWROOM
              </Box>
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={3.5}
            sx={{ flex: 1, justifyContent: 'center', display: { xs: 'none', md: 'flex' } }}
          >
            {NAV_ITEMS.map((item) => (
              <Box key={item.path} component={NavLink} to={item.path} end={item.path === '/customer'} sx={linkSx}>
                {item.label}
              </Box>
            ))}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} sx={{ color: clientColors.text }}>
              <Badge badgeContent={unread} color="error">
                <NotificationsNoneRoundedIcon />
              </Badge>
            </IconButton>

            <Button
              variant="contained"
              size="small"
              onClick={() => nav('/customer/showroom')}
              sx={{ display: { xs: 'none', sm: 'inline-flex' }, px: 2.5 }}
            >
              Browse Vehicles
            </Button>

            <IconButton onClick={(e) => setAccountAnchor(e.currentTarget)}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: clientColors.surface2, color: clientColors.accent, fontWeight: 700, border: `1px solid ${clientColors.border}` }}>
                {user?.name?.[0]}
              </Avatar>
            </IconButton>

            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: 'inline-flex', md: 'none' }, color: clientColors.text }}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={accountAnchor} open={!!accountAnchor} onClose={() => setAccountAnchor(null)}>
        <MenuItem
          onClick={() => {
            setAccountAnchor(null);
            nav('/customer/profile');
          }}
        >
          Profile
        </MenuItem>
        <MenuItem onClick={logout}>Logout</MenuItem>
      </Menu>

      <Menu anchorEl={notifAnchor} open={!!notifAnchor} onClose={() => setNotifAnchor(null)}>
        {mine.slice(0, 6).map((x) => (
          <MenuItem key={x.id} onClick={() => markRead(x.id)}>
            <Box>
              <Typography variant="body2" fontWeight={x.read ? 400 : 700}>
                {x.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {x.message}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        {!mine.length && <MenuItem disabled>No notifications</MenuItem>}
        <Divider />
        <MenuItem
          onClick={() => {
            setNotifAnchor(null);
            nav('/customer/notifications');
          }}
        >
          View all
        </MenuItem>
      </Menu>

      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 240, bgcolor: clientColors.bg, height: '100%', color: clientColors.text }}>
          <List sx={{ pt: 2 }}>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{ color: clientColors.text }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
            <ListItemButton
              component={NavLink}
              to="/customer/notifications"
              onClick={() => setMobileOpen(false)}
              sx={{ color: clientColors.text }}
            >
              <ListItemText primary="Notifications" />
            </ListItemButton>
            <ListItemButton
              component={NavLink}
              to="/customer/profile"
              onClick={() => setMobileOpen(false)}
              sx={{ color: clientColors.text }}
            >
              <ListItemText primary="Profile" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
