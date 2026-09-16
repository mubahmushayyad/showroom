import { Grid, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Stack, Alert } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleIcon from '@mui/icons-material/People';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { useApp } from '../../context/AppContext';
import { inventoryStats, profitStats, isLowStock } from '../../utils/calculations';
import { money } from '../../utils/formatters';

// Admin's dashboard is deliberately a subset of Super Admin's — no
// Users/Manager-assignment/Audit-Log widgets here (section 2 permission
// matrix: Admin gets LIMITED, operational-only visibility).
export default function Dashboard() {
  const { cars, customers, applications } = useApp();
  const s = inventoryStats(cars);
  const p = profitStats(cars);

  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="Operational overview — limited to what Super Admin has granted." />
      <Grid container spacing={2} mb={3}>
        {[
          ['Total Vehicles', s.total, DirectionsCarIcon],
          ['Available', s.available, DirectionsCarIcon],
          ['Reserved / Sold', `${s.reserved} / ${s.sold}`, DirectionsCarIcon],
          ['Customers', customers.length, PeopleIcon],
          ['Pending Review', applications.filter((a) => a.status === 'PENDING').length, PendingActionsIcon],
          ['Estimated Profit', money(p.profit), AttachMoneyIcon],
        ].map(([t, v, I]) => (
          <Grid item xs={12} sm={6} md={4} key={t}>
            <StatCard title={t} value={v} icon={I} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={800} mb={1}>
              Recent Applications
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications
                  .slice(-6)
                  .reverse()
                  .map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.id}</TableCell>
                      <TableCell>{a.fullName}</TableCell>
                      <TableCell>{a.carName}</TableCell>
                      <TableCell>
                        <StatusChip status={a.status} />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={800} mb={1}>
              Low Stock
            </Typography>
            {cars.filter(isLowStock).map((c) => (
              <Stack key={c.id} direction="row" justifyContent="space-between" py={1}>
                <Typography>
                  {c.make} {c.model}
                </Typography>
                <Typography fontWeight={800}>{c.stock}</Typography>
              </Stack>
            ))}
            {!cars.filter(isLowStock).length && <Typography color="text.secondary">No low-stock vehicles.</Typography>}
          </Paper>
          <Alert severity="info" sx={{ mt: 3 }}>
            Approvals, Manager assignment, User registration and the Audit Log are Super Admin-only
            (section 2 of the guide) and aren't shown here.
          </Alert>
        </Grid>
      </Grid>
    </>
  );
}
