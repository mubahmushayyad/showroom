import { useMemo, useState } from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

// Section 6 — "Manager = assigned customers only." Clicking a row opens
// the full workflow: verify -> select vehicle -> finance plan -> payments.
export default function AssignedCustomers() {
  const { applications } = useApp();
  const { user } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState('');

  const mine = useMemo(() => applications.filter((a) => a.managerId === user.id), [applications, user.id]);
  const rows = useMemo(
    () => mine.filter((a) => [a.id, a.fullName, a.phone, a.carName].join(' ').toLowerCase().includes(q.toLowerCase())),
    [mine, q]
  );

  return (
    <>
      <PageHeader title="Assigned Customers" subtitle="Only applications assigned to you are shown — enforced server-side by managerId." />
      <SearchBar value={q} onChange={setQ} placeholder="Search by name, phone, vehicle…" sx={{ mb: 2 }} />
      {!rows.length && <EmptyState title="No assigned customers" text="Once Super Admin assigns you a customer, they'll appear here." />}
      {!!rows.length && (
        <Paper sx={{ overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                {['ID', 'Customer', 'Phone', 'Vehicle', 'Status', ''].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id} hover sx={{ cursor: 'pointer' }} onClick={() => nav(`/manager/applications/${a.id}`)}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{a.fullName}</TableCell>
                  <TableCell>{a.phone}</TableCell>
                  <TableCell>{a.carName}</TableCell>
                  <TableCell>
                    <StatusChip status={a.status} />
                  </TableCell>
                  <TableCell>
                    <Typography color="primary.main" fontWeight={700}>
                      Open →
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </>
  );
}
