import { Grid, Paper, Typography, Box, LinearProgress } from '@mui/material';
import { money } from '../../utils/formatters';

// Compact "financedAmount / paid / remaining" summary shown on both
// the Manager's workflow screen and the Customer's My Finance screen
// (section 7/18 of the guide) — figures always come straight from the
// backend's FinancePlan/Payment records, never recalculated in React.
export default function FinanceSummary({ plan, totalPaid = 0 }) {
  if (!plan) return null;
  const remaining = Math.max((plan.financedAmount || 0) - totalPaid, 0);
  const pct = plan.financedAmount ? Math.min(100, Math.round((totalPaid / plan.financedAmount) * 100)) : 0;

  const rows = [
    ['Vehicle Price', plan.vehiclePrice],
    ['Down Payment', plan.downPayment],
    ['Financed Amount', plan.financedAmount],
    ['Installment Amount', plan.installmentAmount],
    ['Paid So Far', totalPaid],
    ['Remaining Balance', remaining],
  ];

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h6" fontWeight={800} mb={1.5}>
        Finance Summary
      </Typography>
      <Grid container spacing={2} mb={2}>
        {rows.map(([label, value]) => (
          <Grid item xs={6} sm={4} key={label}>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography fontWeight={700}>{money(value)}</Typography>
          </Grid>
        ))}
      </Grid>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {pct}% paid · {plan.duration} {plan.frequency?.toLowerCase()} installments
        </Typography>
        <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4, mt: 0.5 }} />
      </Box>
    </Paper>
  );
}
