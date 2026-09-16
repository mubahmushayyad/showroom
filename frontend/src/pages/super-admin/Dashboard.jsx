import { Grid, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Stack } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleIcon from '@mui/icons-material/People';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import AssignmentLateRoundedIcon from '@mui/icons-material/AssignmentLateRounded';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { useApp } from '../../context/AppContext';
import { inventoryStats, profitStats, isLowStock } from '../../utils/calculations';
import { money, dateTime } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';

// Full-control dashboard (section 4 of the guide): everything an
// Admin/Manager/Customer dashboard shows, plus Users, unassigned
// applications, and system-wide Audit history.
export default function Dashboard() {
  const { cars, customers, applications, users, activity } = useApp();
  const s = inventoryStats(cars);
  const p = profitStats(cars);
  const pending = applications.filter((a) => a.status === 'PENDING').length;
  const unassigned = applications.filter((a) => a.status === 'APPROVED').length;
  const managers = users.filter((u) => u.role === ROLES.MANAGER).length;

  return (
    <>
      <PageHeader title="Super Admin Dashboard" subtitle="Full visibility and control across the showroom." />
      <Grid container spacing={2} mb={3}>
        {[
          ['Total Vehicles', s.total, DirectionsCarIcon],
          ['Available', s.available, DirectionsCarIcon],
          ['Customers', customers.length, PeopleIcon],
          ['Managers', managers, GroupRoundedIcon],
          ['Pending Review', pending, PendingActionsIcon],
          ['Awaiting Manager Assignment', unassigned, AssignmentLateRoundedIcon],
          ['Estimated Profit', money(p.profit), AttachMoneyIcon],
          ['Low Stock', s.lowStock, DirectionsCarIcon],
        ].map(([t, v, I]) => (
          <Grid item xs={12} sm={6} md={3} key={t}>
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
                  .slice(-8)
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
            <Typography variant="h6" fontWeight={800}>
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
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" fontWeight={800}>
              Recent Audit Activity
            </Typography>
            {activity.slice(0, 6).map((a) => (
              <Typography key={a.id} variant="body2" sx={{ py: 0.7 }}>
                <b>{a.action}</b> {a.entity}: {a.details}
                <br />
                <small>
                  {a.user} · {dateTime(a.createdAt)}
                </small>
              </Typography>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
