import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography } from '@mui/material';
import StatusChip from '../common/StatusChip';
import EmptyState from '../common/EmptyState';
import { money, dateTime } from '../../utils/formatters';

// Renders the installment schedule for a FinancePlan (section 9/13 of
// the guide). Read-only — the Manager records payments separately via
// PaymentForm, and paidAmount/status here always reflect what the
// backend has already reconciled.
export default function InstallmentTable({ installments = [] }) {
  if (!installments.length) {
    return <EmptyState title="No installment schedule yet" text="A schedule appears once a finance plan is created." />;
  }
  return (
    <Paper sx={{ overflow: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {['#', 'Due Date', 'Amount', 'Paid', 'Status'].map((h) => (
              <TableCell key={h}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {installments.map((i, idx) => (
            <TableRow key={i.id || idx} hover>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{i.dueDate ? new Date(i.dueDate).toLocaleDateString() : '—'}</TableCell>
              <TableCell>{money(i.amount)}</TableCell>
              <TableCell>{money(i.paidAmount || 0)}</TableCell>
              <TableCell>
                <StatusChip status={i.status || 'Pending'} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!!installments.some((i) => i.updatedAt) && (
        <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
          Last updated {dateTime(installments[0].updatedAt || installments[0].createdAt)}
        </Typography>
      )}
    </Paper>
  );
}
