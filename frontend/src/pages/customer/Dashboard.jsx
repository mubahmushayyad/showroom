import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
} from '@mui/material';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import PriceCheckRoundedIcon from '@mui/icons-material/PriceCheckRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { clientColors } from '../../theme/theme';
import CarCard from '../../components/cars/CarCard';

const FEATURES = [
  {
    icon: VerifiedRoundedIcon,
    title: 'Verified Vehicles',
    text: 'Every listing is inspected and verified before it reaches the showroom floor.',
  },
  {
    icon: BoltRoundedIcon,
    title: 'Fast Approvals',
    text: 'Apply online and track your application status in real time, no paperwork chases.',
  },
  {
    icon: PriceCheckRoundedIcon,
    title: 'Transparent Pricing',
    text: 'No hidden fees. What you see on the listing is what you negotiate from.',
  },
  {
    icon: SupportAgentRoundedIcon,
    title: 'Dedicated Support',
    text: 'A showroom team on standby to help with financing, trade-ins and delivery.',
  },
];

function StatPill({ icon: Icon, label, value }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{
        px: 2.5,
        py: 1.5,
        borderRadius: 3,
        border: `1px solid ${clientColors.border}`,
        bgcolor: 'rgba(245,239,228,0.03)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(201,162,39,0.12)',
          color: clientColors.accent,
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function CustomerDashboard() {
  const { cars, applications } = useApp();
  const { user } = useAuth();
  const nav = useNavigate();

  const mine = applications.filter((a) => a.userId === user.id);
  const available = cars.filter((c) => c.status === 'Available');
  // Cars flagged "Show as Featured" on the Admin → Cars form (see
  // pages/admin/Cars.jsx) drive this section. Falls back to the first
  // few available cars so it's never empty before anything is flagged.
  const featured = useMemo(() => {
    const marked = available.filter((c) => c.featured);
    return (marked.length ? marked : available).slice(0, 3);
  }, [available]);
  const firstName = user?.name?.split(' ')?.[0] || user?.name;

  return (
    <Box>
      {/* HERO */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderBottom: `1px solid ${clientColors.border}`,
          background: `radial-gradient(1200px 500px at 15% -10%, rgba(201,162,39,0.18), transparent 60%),
                       radial-gradient(900px 400px at 100% 0%, rgba(201,162,39,0.10), transparent 55%),
                       ${clientColors.bg}`,
        }}
      >
        {/* decorative grid pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.5,
            backgroundImage:
              'linear-gradient(rgba(245,239,228,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(245,239,228,0.045) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
            maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 7, md: 11 } }}>
          <Chip
            label="U DEVS CAR SHOWROOM"
            size="small"
            sx={{
              mb: 3,
              bgcolor: 'rgba(201,162,39,0.12)',
              color: clientColors.accent,
              fontWeight: 700,
              letterSpacing: '0.08em',
              border: `1px solid ${clientColors.border}`,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              maxWidth: 720,
              fontSize: { xs: 34, sm: 44, md: 54 },
              lineHeight: 1.1,
              mb: 2,
            }}
          >
            Welcome back,{' '}
            <Box component="span" sx={{ color: clientColors.accent }}>
              {firstName}
            </Box>
            .
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 560, fontWeight: 400, mb: 5, fontFamily: 'Inter, sans-serif' }}
          >
            Discover your next vehicle, track applications and manage your garage — all
            in one place.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={6}>
            <Button
              size="large"
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => nav('/customer/showroom')}
              sx={{ px: 4, py: 1.4 }}
            >
              Browse Showroom
            </Button>
            <Button
              size="large"
              variant="outlined"
              onClick={() => nav('/customer/applications')}
              sx={{
                px: 4,
                py: 1.4,
                borderColor: clientColors.border,
                color: clientColors.text,
                '&:hover': { borderColor: clientColors.accent, bgcolor: 'rgba(201,162,39,0.06)' },
              }}
            >
              My Applications
            </Button>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
            <StatPill icon={DirectionsCarFilledRoundedIcon} label="Available cars" value={available.length} />
            <StatPill icon={AssignmentTurnedInRoundedIcon} label="My applications" value={mine.length} />
            <StatPill icon={FavoriteRoundedIcon} label="Wishlist saved" value={JSON.parse(localStorage.getItem('udevs_wishlist') || '[]').length} />
          </Stack>
        </Container>
      </Box>

      {/* FEATURED VEHICLES */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2} mb={4}>
          <Box>
            <Typography variant="overline" sx={{ color: clientColors.accent, letterSpacing: '0.1em', fontWeight: 700 }}>
              JUST FOR YOU
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              Featured Vehicles
            </Typography>
          </Box>
          <Button
            onClick={() => nav('/customer/showroom')}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{ color: clientColors.accent }}
          >
            View all
          </Button>
        </Stack>

        {featured.length ? (
          <Grid container spacing={3}>
            {featured.map((car) => (
              <Grid item xs={12} sm={6} md={4} key={car.id}>
                <CarCard car={car} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              border: `1px dashed ${clientColors.border}`,
              borderRadius: 3,
              color: clientColors.textMuted,
            }}
          >
            No vehicles available right now — check back soon.
          </Box>
        )}
      </Container>

      {/* WHY CHOOSE US */}
      <Box sx={{ bgcolor: clientColors.surface, borderTop: `1px solid ${clientColors.border}`, borderBottom: `1px solid ${clientColors.border}` }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Box textAlign="center" mb={6}>
            <Typography variant="overline" sx={{ color: clientColors.accent, letterSpacing: '0.1em', fontWeight: 700 }}>
              WHY U DEVS
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              Built around a better car-buying experience
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {FEATURES.map((f) => (
              <Grid item xs={12} sm={6} md={3} key={f.title}>
                <Stack spacing={1.5} sx={{ height: '100%' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'rgba(201,162,39,0.12)',
                      color: clientColors.accent,
                    }}
                  >
                    <f.icon />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.text}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA BANNER */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            border: `1px solid ${clientColors.border}`,
            px: { xs: 4, md: 8 },
            py: { xs: 5, md: 7 },
            textAlign: 'center',
            background: `linear-gradient(135deg, rgba(201,162,39,0.14), rgba(201,162,39,0.02))`,
          }}
        >
          <Typography variant="h4" fontWeight={700} mb={1.5}>
            Ready to find your next car?
          </Typography>
          <Typography color="text.secondary" mb={4} sx={{ maxWidth: 480, mx: 'auto' }}>
            Explore the full showroom inventory and apply in minutes.
          </Typography>
          <Button
            size="large"
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => nav('/customer/showroom')}
            sx={{ px: 5, py: 1.4 }}
          >
            Explore Showroom
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
