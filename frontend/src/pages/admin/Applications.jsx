import { useMemo, useState } from 'react';
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import { APP_STATUS_LABELS, STATUS_NEXT, ROLES } from '../../utils/constants';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

// Shared by Super Admin (/super-admin/applications) and Admin
// (/admin/applications). Section 2 permission matrix: Super Admin can
// Approve/Pending/Reject and Assign Manager; Admin only gets a
// read-only view of status + assigned manager — the backend is the
// real enforcement point either way (section 14, "never trust React").
export default function Applications() {
  const { applications, updateApplication, assignManager, users } = useApp();
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const isSuperAdmin = user.role === ROLES.SUPER_ADMIN;

  const managers = useMemo(() => users.filter((u) => u.role === ROLES.MANAGER && u.status === 'Active'), [users]);

  const rows = useMemo(
    () =>
      applications.filter((a) =>
        [a.id, a.fullName, a.carName, a.phone].join(' ').toLowerCase().includes(q.toLowerCase())
      ),
    [applications, q]
  );

  const managerName = (id) => users.find((u) => u.id === id)?.name || '—';

  return (
    <>
      <PageHeader
        title="Applications / Orders"
        subtitle={
          isSuperAdmin
            ? 'Review applications, approve or reject, and assign a Manager (section 4 of the workflow).'
            : 'Read-only view of application status and manager assignment.'
        }
      />
      <SearchBar value={q} onChange={setQ} placeholder="Search by ID, customer, vehicle…" sx={{ mb: 2 }} />
      {!rows.length && <EmptyState title="No applications yet" text="Submitted customer applications will show up here." />}
      {!!rows.length && (
        <Paper sx={{ overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                {['ID', 'Customer', 'Vehicle', 'Color', 'Date', 'Status', 'Manager', isSuperAdmin ? 'Update Status' : null, isSuperAdmin ? 'Assign Manager' : null]
                  .filter(Boolean)
                  .map((h) => (
                    <TableCell key={h}>{h}</TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((a) => {
                const nextOptions = STATUS_NEXT[a.status] || [];
                return (
                  <TableRow key={a.id} hover>
                    <TableCell>{a.id}</TableCell>
                    <TableCell>
                      {a.fullName}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {a.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>{a.carName}</TableCell>
                    <TableCell>{a.color}</TableCell>
                    <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <StatusChip status={a.status} />
                    </TableCell>
                    <TableCell>
                      {a.managerId ? <Chip size="small" label={managerName(a.managerId)} /> : '—'}
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        {nextOptions.length ? (
                          <TextField
                            select
                            size="small"
                            value=""
                            displayEmpty
                            SelectProps={{ displayEmpty: true }}
                            onChange={(e) => updateApplication(a.id, { status: e.target.value }, user.name)}
                            sx={{ minWidth: 170 }}
                          >
                            <MenuItem value="" disabled>
                              Move to…
                            </MenuItem>
                            {nextOptions.map((s) => (
                              <MenuItem key={s} value={s}>
                                {APP_STATUS_LABELS[s]}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No further action
                          </Typography>
                        )}
                      </TableCell>
                    )}
                    {isSuperAdmin && (
                      <TableCell>
                        {a.status === 'APPROVED' || a.status === 'ASSIGNED' ? (
                          <TextField
                            select
                            size="small"
                            value={a.managerId || ''}
                            displayEmpty
                            onChange={(e) => assignManager(a.id, e.target.value, user.name)}
                            sx={{ minWidth: 170 }}
                          >
                            <MenuItem value="" disabled>
                              Choose Manager
                            </MenuItem>
                            {managers.map((m) => (
                              <MenuItem key={m.id} value={m.id}>
                                {m.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Approve first
                          </Typography>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
      <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
        {Object.entries(APP_STATUS_LABELS).map(([code, label]) => (
          <Chip key={code} size="small" variant="outlined" label={`${code} = ${label}`} />
        ))}
      </Stack>
    </>
  );
}
