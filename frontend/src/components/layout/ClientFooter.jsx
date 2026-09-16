import { Box, Container, Grid, Typography, Stack, IconButton, Divider } from '@mui/material';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import { NavLink } from 'react-router-dom';
import { clientColors } from '../../theme/theme';

const LINK_COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'Showroom', path: '/customer/showroom' },
      { label: 'Wishlist', path: '/customer/wishlist' },
      { label: 'Compare Vehicles', path: '/customer/compare' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My Applications', path: '/customer/applications' },
      { label: 'Profile', path: '/customer/profile' },
      { label: 'Notifications', path: '/customer/notifications' },
    ],
  },
];

const SOCIALS = [
  { icon: FacebookRoundedIcon, label: 'Facebook' },
  { icon: InstagramIcon, label: 'Instagram' },
  { icon: TwitterIcon, label: 'Twitter' },
  { icon: LinkedInIcon, label: 'LinkedIn' },
];

const linkSx = {
  color: clientColors.textMuted,
  textDecoration: 'none',
  fontSize: 14,
  transition: 'color .15s ease',
  '&:hover': { color: clientColors.accent },
};

export default function ClientFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        bgcolor: clientColors.surface,
        borderTop: `1px solid ${clientColors.border}`,
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={5}>
          <Grid item xs={12} md={4}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
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
              <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 18 }}>
                U DEVS
                <Box
                  component="span"
                  sx={{
                    color: clientColors.textMuted,
                    fontWeight: 500,
                    fontSize: 10,
                    fontFamily: 'Inter, sans-serif',
                    display: 'block',
                    letterSpacing: '0.14em',
                    lineHeight: 1.4,
                  }}
                >
                  CAR SHOWROOM
                </Box>
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mb: 3 }}>
              A modern showroom experience — browse verified vehicles, apply online and
              track everything from one dashboard.
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <PlaceRoundedIcon sx={{ fontSize: 18, color: clientColors.accent }} />
                <Typography variant="body2" color="text.secondary">
                  Lahore, Pakistan
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <CallRoundedIcon sx={{ fontSize: 18, color: clientColors.accent }} />
                <Typography variant="body2" color="text.secondary">
                  +92 300 1234567
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <EmailRoundedIcon sx={{ fontSize: 18, color: clientColors.accent }} />
                <Typography variant="body2" color="text.secondary">
                  support@udevs.com
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          {LINK_COLUMNS.map((col) => (
            <Grid item xs={6} md={2} key={col.title}>
              <Typography variant="subtitle2" fontWeight={700} mb={2}>
                {col.title}
              </Typography>
              <Stack spacing={1.2}>
                {col.links.map((l) => (
                  <Box key={l.path} component={NavLink} to={l.path} sx={linkSx}>
                    {l.label}
                  </Box>
                ))}
              </Stack>
            </Grid>
          ))}

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={700} mb={2}>
              Stay in the loop
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Follow along for new arrivals and showroom updates.
            </Typography>
            <Stack direction="row" spacing={1}>
              {SOCIALS.map((s) => (
                <IconButton
                  key={s.label}
                  aria-label={s.label}
                  size="small"
                  sx={{
                    border: `1px solid ${clientColors.border}`,
                    color: clientColors.textMuted,
                    '&:hover': { color: clientColors.accent, borderColor: clientColors.accent },
                  }}
                >
                  <s.icon fontSize="small" />
                </IconButton>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: clientColors.border }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={1.5}
        >
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} U Devs Car Showroom. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Typography variant="caption" color="text.secondary">
              Privacy Policy
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Terms of Service
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
