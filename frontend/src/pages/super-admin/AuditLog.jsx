import { useState, useMemo } from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, Chip } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import { useApp } from '../../context/AppContext';
import { dateTime } from '../../utils/formatters';

// Section 9/24 of the guide: AuditLog { userId, action, entity, entityId,
// metadata, createdAt } — every important create/update/delete/status
// change is written server-side. This page just reads and displays it.
export default function AuditLog() {
  const { activity } = useApp();
  const [q, setQ] = useState('');

  const rows = useMemo(
    () => activity.filter((a) => [a.action, a.entity, a.details, a.user].join(' ').toLowerCase().includes(q.toLowerCase())),
    [activity, q]
  );

  return (
    <>
      <PageHeader title="Audit Log" subtitle="Every critical action across the system, in one auditable trail." />
      <SearchBar value={q} onChange={setQ} placeholder="Search by action, entity, user…" sx={{ mb: 2 }} />
      {!rows.length && <EmptyState title="No activity yet" text="Actions taken across the system will appear here." />}
      {!!rows.length && (
        <Paper sx={{ overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Action', 'Entity', 'Details', 'Performed By', 'When'].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>
                    <Chip size="small" label={a.action} />
                  </TableCell>
                  <TableCell>{a.entity}</TableCell>
                  <TableCell>{a.details}</TableCell>
                  <TableCell>{a.user}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{dateTime(a.createdAt)}</Typography>
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
