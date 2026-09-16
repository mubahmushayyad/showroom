import { useMemo, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  MenuItem,
  TextField,
  Stack,
  Typography,
  Button,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PriceCheckRoundedIcon from '@mui/icons-material/PriceCheckRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import SearchBar from '../../components/common/SearchBar';
import CarCard from '../../components/cars/CarCard';
import { useApp } from '../../context/AppContext';
import { FUEL, COLORS } from '../../utils/constants';
import { money } from '../../utils/formatters';
import useDebounce from '../../hooks/useDebounce';
import { clientColors } from '../../theme/theme';
import { resolveImageUrl } from '../../services/carApi';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1800&q=80';

const BUDGETS = [
  { label: 'Any budget', value: '' },
  { label: 'Under Rs. 6M', value: 6000000 },
  { label: 'Under Rs. 8M', value: 8000000 },
  { label: 'Under Rs. 10M', value: 10000000 },
  { label: 'Above Rs. 10M', value: Infinity },
];

const SERVICES = [
  {
    icon: PriceCheckRoundedIcon,
    title: 'Trade-In Valuation',
    text: 'Get a fair, transparent quote for your current vehicle and put it straight toward your next one.',
  },
  {
    icon: PaymentsRoundedIcon,
    title: 'Flexible Financing',
    text: 'Apply for installment plans in minutes, with terms tailored to your budget and credit profile.',
  },
  {
    icon: LocalShippingRoundedIcon,
    title: 'Doorstep Delivery',
    text: 'Once approved, we prepare and deliver your vehicle to your home or office, fully inspected.',
  },
];

const FAQS = [
  {
    q: 'Can I take a vehicle for a test drive?',
    a: 'Yes — visit any of our showroom locations or contact your assigned sales manager to schedule one for any vehicle marked Available.',
  },
  {
    q: 'How long does financing approval take?',
    a: 'Most applications submitted through the showroom are reviewed within 1–2 business days. You can track the status under My Applications.',
  },
  {
    q: 'Do you accept trade-ins?',
    a: 'Yes, our team will value your current vehicle and apply it as credit toward your purchase.',
  },
  {
    q: 'Is delivery available outside the city?',
    a: 'We deliver nationwide once financing and paperwork are finalized.',
  },
];

export default function Showroom() {
  const { cars, suppliers, applications } = useApp();
  const [q, setQ] = useState('');
  const [fuel, setFuel] = useState('');
  const [color, setColor] = useState('');
  const [make, setMake] = useState('');
  const [budget, setBudget] = useState('');
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('udevs_wishlist') || '[]'));
  const [compare, setCompare] = useState(() => JSON.parse(localStorage.getItem('udevs_compare') || '[]'));
  const dq = useDebounce(q);

  const makes = useMemo(() => [...new Set(cars.map((c) => c.make))].sort(), [cars]);
  const available = useMemo(() => cars.filter((c) => c.status === 'Available'), [cars]);
  // Admin-picked "Show as Featured" cars (Admin → Cars form) drive this
  // section. Falls back to the first few available cars so the "Our
  // Fleet" strip is never empty before any car has been flagged.
  const featured = useMemo(() => {
    const marked = available.filter((c) => c.featured);
    return (marked.length ? marked : available).slice(0, 3);
  }, [available]);
  const topPicks = useMemo(
    () => [...available].sort((a, b) => b.sellingPrice - a.sellingPrice).slice(0, 3),
    [available]
  );

  const rows = useMemo(
    () =>
      cars.filter(
        (c) =>
          c.status === 'Available' &&
          `${c.make} ${c.model} ${c.variant} ${c.year}`.toLowerCase().includes(dq.toLowerCase()) &&
          (!fuel || c.fuel === fuel) &&
          (!color || c.colors.includes(color)) &&
          (!make || c.make === make) &&
          (!budget || c.sellingPrice <= budget)
      ),
    [cars, dq, fuel, color, make, budget]
  );

  const wish = (c) => {
    const next = wishlist.includes(c.id) ? wishlist.filter((x) => x !== c.id) : [...wishlist, c.id];
    setWishlist(next);
    localStorage.setItem('udevs_wishlist', JSON.stringify(next));
  };

  const comp = (c) => {
    if (compare.includes(c.id)) return;
    const next = compare.length >= 3 ? [...compare.slice(1), c.id] : [...compare, c.id];
    setCompare(next);
    localStorage.setItem('udevs_compare', JSON.stringify(next));
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <Box sx={{ color: clientColors.text }}>
      {/* HERO */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: 460, md: 640 },
          display: 'flex',
          alignItems: 'flex-end',
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,199,126,0.16) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 20% 100%, rgba(139,94,20,0.35) 0%, transparent 70%),
            linear-gradient(180deg, #15100a 0%, #0f0a06 55%, #100b08 100%)`,
        }}
      >
        <Box
          component="img"
          src={HERO_IMAGE}
          alt="Featured vehicle"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.5,
            mixBlendMode: 'luminosity',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(16,11,8,0.55) 0%, rgba(16,11,8,0.35) 40%, #100b08 100%)',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center', pb: { xs: 5, md: 8 }, pt: { xs: 10, md: 14 } }}>
          <Typography variant="overline" sx={{ color: clientColors.accentLight, letterSpacing: '0.25em', fontWeight: 700 }}>
            U DEVS CAR SHOWROOM
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 56 }, mt: 1, mb: 2 }}>
            Drive <Box component="span" sx={{ color: clientColors.accent }}>Distinction.</Box>
          </Typography>
          <Typography variant="body1" sx={{ color: clientColors.textMuted, maxWidth: 480, mx: 'auto', mb: 4 }}>
            A curated selection of premium vehicles, transparent pricing and financing tailored to you —
            handpicked for those who expect more.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" size="large" onClick={() => scrollTo('fleet')} sx={{ px: 4 }}>
              View Our Fleet
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => scrollTo('results')}
              sx={{ px: 4, borderColor: clientColors.border, color: clientColors.text, '&:hover': { borderColor: clientColors.accent } }}
            >
              Search Inventory
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* BRAND STRIP */}
      <Box sx={{ borderTop: `1px solid ${clientColors.border}`, borderBottom: `1px solid ${clientColors.border}`, bgcolor: clientColors.surface }}>
        <Container maxWidth="lg">
          <Stack direction="row" spacing={{ xs: 3, md: 6 }} justifyContent="center" flexWrap="wrap" sx={{ py: 2.5 }}>
            {makes.map((m) => (
              <Typography
                key={m}
                sx={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: clientColors.textMuted,
                  fontSize: { xs: 15, md: 18 },
                }}
              >
                {m}
              </Typography>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* OUR FLEET */}
      <Container maxWidth="lg" id="fleet" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 }, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 40 }, color: clientColors.accent }}>
          Our Fleet
        </Typography>
        <Typography sx={{ color: clientColors.textMuted, mt: 1, mb: 6 }}>
          A closer look at a selection of our premium vehicles.
        </Typography>

        <Grid container spacing={3}>
          {featured.map((c) => (
            <Grid item xs={12} sm={6} md={4} key={c.id}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: 300,
                  border: `1px solid ${clientColors.border}`,
                }}
              >
                <Box
                  component="img"
                  src={resolveImageUrl(c.images?.[0])}
                  alt={`${c.make} ${c.model}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 40%, rgba(16,11,8,0.92) 100%)',
                  }}
                />
                <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, p: 2.5 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {c.make} {c.model}
                  </Typography>
                  <Typography variant="caption" sx={{ color: clientColors.textMuted, display: 'block', mb: 1.5 }}>
                    {c.variant} • {c.year}
                  </Typography>
                  <Button size="small" variant="outlined" href={`/customer/cars/${c.id}`} sx={{ borderColor: clientColors.accent, color: clientColors.accentLight }}>
                    View
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Highlights */}
        <Box sx={{ mt: { xs: 7, md: 9 }, maxWidth: 620, mx: 'auto', textAlign: 'left' }}>
          <Stack spacing={1.5}>
            {topPicks.map((c) => (
              <Stack key={c.id} direction="row" spacing={1.5} alignItems="baseline">
                <Box sx={{ color: clientColors.accent, fontSize: 20, lineHeight: 1 }}>—</Box>
                <Typography sx={{ color: clientColors.textMuted }}>
                  <Box component="span" sx={{ color: clientColors.text, fontWeight: 700 }}>
                    {c.make} {c.model}
                  </Box>{' '}
                  — {c.description} From {money(c.sellingPrice)}.
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Box textAlign="center" mt={4}>
            <Button variant="contained" size="large" onClick={() => scrollTo('results')} sx={{ px: 5 }}>
              View Full Inventory
            </Button>
          </Box>
        </Box>
      </Container>

      {/* SERVICES */}
      <Box sx={{ bgcolor: clientColors.surface, borderTop: `1px solid ${clientColors.border}`, borderBottom: `1px solid ${clientColors.border}` }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <Typography variant="h3" textAlign="center" sx={{ fontSize: { xs: 26, md: 34 }, mb: 6 }}>
            Our Services
          </Typography>
          <Grid container spacing={4}>
            {SERVICES.map((s) => (
              <Grid item xs={12} md={4} key={s.title}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <s.icon sx={{ color: clientColors.accent }} />
                    <Typography variant="h6" fontWeight={700}>
                      {s.title}
                    </Typography>
                  </Stack>
                  <Typography sx={{ color: clientColors.textMuted }}>{s.text}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 } }}>
        <Typography variant="h3" textAlign="center" sx={{ fontSize: { xs: 26, md: 34 }, mb: 5 }}>
          Frequently Asked Questions
        </Typography>
        <Stack spacing={1.5}>
          {FAQS.map((f) => (
            <Accordion
              key={f.q}
              disableGutters
              sx={{
                bgcolor: clientColors.surface,
                border: `1px solid ${clientColors.border}`,
                borderRadius: '10px !important',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ color: clientColors.accent }} />}>
                <Typography fontWeight={600}>{f.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: clientColors.textMuted }}>{f.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Container>

      {/* FULL INVENTORY / SEARCH */}
      <Container maxWidth="lg" id="results" sx={{ pb: 10 }}>
        <Paper
          sx={{
            p: { xs: 2, md: 3 },
            mb: 5,
            bgcolor: clientColors.surface2,
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'flex-end' }}>
            <TextField select label="Make" value={make} onChange={(e) => setMake(e.target.value)} fullWidth>
              <MenuItem value="">All makes</MenuItem>
              {makes.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Fuel type" value={fuel} onChange={(e) => setFuel(e.target.value)} fullWidth>
              <MenuItem value="">All fuels</MenuItem>
              {FUEL.map((x) => (
                <MenuItem key={x} value={x}>
                  {x}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Budget" value={budget} onChange={(e) => setBudget(e.target.value)} fullWidth>
              {BUDGETS.map((b) => (
                <MenuItem key={b.label} value={b.value}>
                  {b.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Color" value={color} onChange={(e) => setColor(e.target.value)} fullWidth>
              <MenuItem value="">All colors</MenuItem>
              {COLORS.map((x) => (
                <MenuItem key={x} value={x}>
                  {x}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>

        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} mb={3}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: { xs: 22, md: 28 } }}>
              Full Inventory
            </Typography>
            <Typography variant="body2" sx={{ color: clientColors.textMuted }}>
              {rows.length} vehicle{rows.length === 1 ? '' : 's'} match your search
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ minWidth: 220 }}>
              <SearchBar value={q} onChange={setQ} placeholder="Search make, model, variant or year" />
            </Box>
            <Button
              variant="outlined"
              href="/customer/compare"
              sx={{ borderColor: clientColors.border, color: clientColors.text, '&:hover': { borderColor: clientColors.accent } }}
            >
              Compare ({compare.length})
            </Button>
          </Stack>
        </Stack>

        {/* <Grid container spacing={3}>
          {rows.map((c) => (
            <Grid item xs={12} sm={6} lg={4} key={c.id}>
              <CarCard car={c} onWishlist={wish} wishlisted={wishlist.includes(c.id)} onCompare={comp} />
            </Grid>
          ))}
        </Grid> */}
        <div className="car-grid">
  {rows.map((c) => (
    <div className="car-grid-item" key={c.id}>
      <CarCard
        car={c}
        onWishlist={wish}
        wishlisted={wishlist.includes(c.id)}
        onCompare={comp}
      />
    </div>
  ))}
</div>

        {!rows.length && (
          <Paper sx={{ p: 5, textAlign: 'center', mt: 2 }}>
            <Typography>No vehicles match your filters. Try widening your search.</Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
