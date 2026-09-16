import { List, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Stack } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';

const iconMap = {
  Dashboard: DashboardRoundedIcon,
  Vehicles: DirectionsCarRoundedIcon,
  Cars: DirectionsCarRoundedIcon,
  Suppliers: BusinessRoundedIcon,
  Customers: PeopleRoundedIcon,
  Applications: AssignmentRoundedIcon,
  'Assigned Customers': AssignmentIndRoundedIcon,
  Users: GroupRoundedIcon,
  Reports: AssessmentRoundedIcon,
  Settings: SettingsRoundedIcon,
  Showroom: StorefrontRoundedIcon,
  'My Applications': AssignmentRoundedIcon,
  'My Finance': AccountBalanceWalletRoundedIcon,
  Profile: PersonRoundedIcon,
  Notifications: NotificationsRoundedIcon,
  Wishlist: FavoriteRoundedIcon,
  Compare: CompareArrowsRoundedIcon,
  'Audit Log': HistoryRoundedIcon,
};

const ROOT_PATHS = ['/super-admin', '/admin', '/manager'];

export default function Sidebar({ items, onNavigate }) {
  const theme = useTheme();
  const accent = theme.palette.primary.main;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="center" spacing={1.2} sx={{ px: 2.5, py: 3 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: accent,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <DirectionsCarFilledRoundedIcon sx={{ color: '#1A1108', fontSize: 20 }} />
        </Box>
        <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 18, lineHeight: 1.15 }}>
          U DEVS
          <Box
            component="span"
            sx={{
              display: 'block',
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              letterSpacing: '0.14em',
              color: 'text.secondary',
              fontWeight: 600,
            }}
          >
            CAR SHOWROOM
          </Box>
        </Typography>
      </Stack>

      <List sx={{ px: 1.5, flex: 1 }}>
        {items.map((i) => {
          const Icon = iconMap[i.label] || DashboardRoundedIcon;
          return (
            <NavLink
              key={i.path}
              to={i.path}
              onClick={onNavigate}
              end={ROOT_PATHS.includes(i.path)}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              {({ isActive }) => (
                <ListItemButton
                  selected={isActive}
                  sx={{
                    mb: 0.5,
                    borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
                    bgcolor: isActive ? 'rgba(201,162,39,0.10)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(201,162,39,0.08)' },
                    '&.Mui-selected': { bgcolor: 'rgba(201,162,39,0.10)' },
                    '&.Mui-selected:hover': { bgcolor: 'rgba(201,162,39,0.14)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: isActive ? accent : 'text.secondary' }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={i.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? accent : 'text.primary',
                    }}
                  />
                </ListItemButton>
              )}
            </NavLink>
          );
        })}
      </List>
    </Box>
  );
}
