import { Card, CardContent, Typography, Box } from '@mui/material';

export default function StatCard({ title, value, icon: Icon, subtitle }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box minWidth={0}>
            <Typography color="text.secondary" variant="body2" fontWeight={600} noWrap>
              {title}
            </Typography>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ fontFamily: '"Playfair Display", Georgia, serif', mt: 0.5 }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {Icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(201,162,39,0.12)',
                color: 'primary.main',
                flexShrink: 0,
              }}
            >
              <Icon fontSize="small" />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
