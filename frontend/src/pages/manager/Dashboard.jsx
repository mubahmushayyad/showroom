import { Grid, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Section 6 of the guide: "Manager sees only customers/applications
// where managerId matches the authenticated Manager." The backend is
// expected to already scope GET /applications this way for a Manager
// JWT; this client-side filter is a safety net for the mock/dev API.
export default function Dashboard() {
  const { applications } = useApp();
  const { user } = useAuth();
  const nav = useNavigate();
  const mine = applications.filter((a) => a.managerId === user.id);

  const counts = {
    assigned: mine.filter((a) => a.status === 'ASSIGNED').length,
    inProcess: mine.filter((a) => a.status === 'IN_PROCESS').length,
    vehicleStage: mine.filter((a) => ['VEHICLE_SELECTED', 'FINANCE_SETUP'].includes(a.status)).length,
    inPayment: mine.filter((a) => ['PAYMENT_IN_PROGRESS', 'OVERDUE'].includes(a.status)).length,
  };

  return (
    <>
      <PageHeader title="Manager Dashboard" subtitle="Your assigned customers and where each one stands." />
      <Grid container spacing={2} mb={3}>
        {[
          ['Newly Assigned', counts.assigned, AssignmentIndRoundedIcon],
          ['Verification In Process', counts.inProcess, FactCheckRoundedIcon],
          ['Vehicle / Finance Setup', counts.vehicleStage, DirectionsCarRoundedIcon],
          ['Payments In Progress', counts.inPayment, PaymentsRoundedIcon],
        ].map(([t, v, I]) => (
          <Grid item xs={12} sm={6} md={3} key={t}>
            <StatCard title={t} value={v} icon={I} />
          </Grid>
        ))}
      </Grid>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={800} mb={1}>
          My Assigned Customers
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
            {mine.map((a) => (
              <TableRow key={a.id} hover sx={{ cursor: 'pointer' }} onClick={() => nav(`/manager/applications/${a.id}`)}>
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
        {!mine.length && (
          <Typography color="text.secondary" p={2}>
            No customers assigned to you yet.
          </Typography>
        )}
      </Paper>
    </>
  );
}
