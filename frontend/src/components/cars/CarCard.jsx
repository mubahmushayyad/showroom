import { Card, CardContent, CardMedia, Chip, Button, Typography, Stack, Box, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocalGasStationRoundedIcon from '@mui/icons-material/LocalGasStationRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { money } from '../../utils/formatters';
import { clientColors } from '../../theme/theme';
import { resolveImageUrl } from '../../services/carApi';

export default function CarCard({ car, onCompare, onWishlist, wishlisted }) {
  const nav = useNavigate();
  const statusColor = car.status === 'Available' ? clientColors.accent : clientColors.textMuted;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="190"
          image={resolveImageUrl(car.images?.[0])}
          alt={`${car.make} ${car.model}`}
          sx={{ objectFit: 'cover' }}
        />
        <Chip
          size="small"
          label={car.status}
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            bgcolor: 'rgba(16,11,8,0.75)',
            color: statusColor,
            border: `1px solid ${statusColor}`,
            fontWeight: 700,
          }}
        />
        {car.featured && (
          <Chip
            size="small"
            label="Featured"
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              bgcolor: clientColors.accent,
              color: '#100b08',
              fontWeight: 800,
            }}
          />
        )}
        <IconButton
          size="small"
          onClick={() => onWishlist?.(car)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(16,11,8,0.75)',
            '&:hover': { bgcolor: 'rgba(16,11,8,0.9)' },
          }}
        >
          {wishlisted ? (
            <FavoriteRoundedIcon sx={{ color: clientColors.accent, fontSize: 20 }} />
          ) : (
            <FavoriteBorderRoundedIcon sx={{ color: clientColors.text, fontSize: 20 }} />
          )}
        </IconButton>
      </Box>

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
          {car.make} {car.model}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.25}>
          {car.year} • {car.variant}
        </Typography>

        <Stack direction="row" spacing={2} mt={1.5}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LocalGasStationRoundedIcon sx={{ fontSize: 16, color: clientColors.textMuted }} />
            <Typography variant="caption" color="text.secondary">
              {car.fuel}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <SettingsSuggestRoundedIcon sx={{ fontSize: 16, color: clientColors.textMuted }} />
            <Typography variant="caption" color="text.secondary">
              {car.transmission}
            </Typography>
          </Stack>
        </Stack>

        <Box sx={{ mt: 2, mb: 1.5, display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: clientColors.accent }}>
            {money(car.sellingPrice)}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {car.stock} in stock • {car.colors.join(', ')}
        </Typography>

        <Stack direction="row" spacing={1} mt="auto" pt={2}>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            onClick={() => nav(`/customer/cars/${car.id}`)}
            sx={{ borderColor: clientColors.border, color: clientColors.text, '&:hover': { borderColor: clientColors.accent } }}
          >
            Details
          </Button>
          {car.status === 'Available' && (
            <Button size="small" variant="contained" fullWidth onClick={() => nav(`/customer/apply/${car.id}`)}>
              Apply
            </Button>
          )}
        </Stack>
        <Button size="small" onClick={() => onCompare?.(car)} sx={{ mt: 0.5, color: clientColors.textMuted, alignSelf: 'flex-start' }}>
          + Add to compare
        </Button>
      </CardContent>
    </Card>
  );
}
