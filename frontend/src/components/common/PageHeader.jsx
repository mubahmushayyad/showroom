import { Box, Typography } from '@mui/material';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      gap={2}
      mb={4}
      pb={3}
      flexWrap="wrap"
      sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Box>
        <Typography variant="h4" fontWeight={800} sx={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" mt={0.5}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
