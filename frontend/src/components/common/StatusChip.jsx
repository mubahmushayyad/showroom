import { Chip } from '@mui/material';
import { APP_STATUS_LABELS } from '../../utils/constants';

const COLOR_MAP = {
  // Vehicle / user status
  Available: 'success',
  Active: 'success',
  Sold: 'default',
  Reserved: 'warning',
  Inactive: 'default',
  // Application workflow status (section 8/20 of the guide)
  PENDING: 'warning',
  APPROVED: 'info',
  REJECTED: 'error',
  ASSIGNED: 'info',
  IN_PROCESS: 'warning',
  VEHICLE_SELECTED: 'info',
  FINANCE_SETUP: 'info',
  PAYMENT_IN_PROGRESS: 'warning',
  READY_FOR_DELIVERY: 'secondary',
  COMPLETED: 'success',
  OVERDUE: 'error',
};

export default function StatusChip({ status }) {
  const label = APP_STATUS_LABELS[status] || status;
  return <Chip size="small" label={label} color={COLOR_MAP[status] || 'default'} />;
}
