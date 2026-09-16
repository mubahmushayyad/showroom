import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, Badge } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ onMenu }) {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { notifications, markRead } = useApp();
  const [a, setA] = useState(null);
  const [n, setN] = useState(null);
  const nav = useNavigate();
  const mine = notifications.filter((x) => !x.userId || x.userId === user?.id);

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}` }}
    >
      <Toolbar sx={{ gap: 0.5 }}>
        <IconButton onClick={onMenu} sx={{ mr: 1, display: { md: 'none' } }}>
          <MenuRoundedIcon />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={800} noWrap sx={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Welcome, {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.role}
          </Typography>
        </Box>

        <IconButton onClick={(e) => setN(e.currentTarget)} sx={{ color: 'text.primary' }}>
          <Badge badgeContent={mine.filter((x) => !x.read).length} color="error">
            <NotificationsNoneRoundedIcon />
          </Badge>
        </IconButton>

        <IconButton onClick={(e) => setA(e.currentTarget)}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'rgba(201,162,39,0.14)',
              color: 'primary.main',
              fontWeight: 700,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {user?.name?.[0]}
          </Avatar>
        </IconButton>

        <Menu anchorEl={a} open={!!a} onClose={() => setA(null)}>
          <MenuItem
            onClick={() => {
              setA(null);
              nav(user?.role === 'Customer' ? '/customer/profile' : '/admin/settings');
            }}
          >
            Profile / Settings
          </MenuItem>
          <MenuItem onClick={logout}>Logout</MenuItem>
        </Menu>

        <Menu anchorEl={n} open={!!n} onClose={() => setN(null)}>
          {mine.slice(0, 5).map((x) => (
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
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
