import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StatusChip from '../common/StatusChip';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';

export default function UserTable({ users, loading, onEdit, onDelete }) {
  if (loading && !users.length) return <LoadingSpinner />;
  if (!loading && !users.length) {
    return <EmptyState title="No users found" text="Add a user to get started." />;
  }

  return (
    <Paper sx={{ overflow: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            {['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map((h) => (
              <TableCell key={h}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone || '—'}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <StatusChip status={user.status} />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(user)} aria-label={`Edit ${user.name}`}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => onDelete(user)}
                  aria-label={`Delete ${user.name}`}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
