import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function MyApplications() {
  const { applications } = useApp();
  const { user } = useAuth();
  const nav = useNavigate();
  const mine = applications.filter((a) => a.userId === user.id);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <PageHeader title="My Applications / Orders" subtitle="Only your own application records are displayed. Click a row for finance details." />
      <Paper sx={{ overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              {['Application ID', 'Vehicle', 'Color', 'Date', 'Status'].map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {mine.map((a) => (
              <TableRow key={a.id} hover sx={{ cursor: 'pointer' }} onClick={() => nav(`/customer/applications/${a.id}`)}>
                <TableCell>{a.id}</TableCell>
                <TableCell>{a.carName}</TableCell>
                <TableCell>{a.color}</TableCell>
                <TableCell>{new Date(a.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <StatusChip status={a.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!mine.length && <Typography p={4} color="text.secondary">You have not submitted an application yet.</Typography>}
      </Paper>
    </Container>
  );
}
