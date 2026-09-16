import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Paper, Typography, Stack, Chip, Alert, Breadcrumbs, Link } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import FinanceSummary from '../../components/finance/FinanceSummary';
import InstallmentTable from '../../components/finance/InstallmentTable';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getFinancePlanApi } from '../../services/financeApi';
import { getInstallmentsApi } from '../../services/installmentApi';
import { getPaymentsApi } from '../../services/paymentApi';

// Section 7 of the guide: "View selected vehicle, price, down payment,
// installment amount, duration, paid amount and remaining balance" —
// plus the assigned Manager, once one exists. Everything here is
// read-only; a Customer can never edit official financial totals.
export default function ApplicationDetail() {
  const { id } = useParams();
  const { applications, users } = useApp();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);

  const application = applications.find((a) => a.id === id && a.userId === user.id);
  const manager = application?.managerId ? users.find((u) => u.id === application.managerId) : null;

  useEffect(() => {
    if (!application) return;
    (async () => {
      try {
        const [p, i, pay] = await Promise.all([
          getFinancePlanApi(application.id),
          getInstallmentsApi(application.id),
          getPaymentsApi(application.id),
        ]);
        setPlan(p);
        setInstallments(i || []);
        setTotalPaid((pay || []).reduce((sum, x) => sum + Number(x.amount || 0), 0));
      } catch {
        /* finance plan not set up yet — non-fatal */
      }
    })();
  }, [application]);

  if (!application) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert severity="warning">Application not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Breadcrumbs sx={{ mb: 1 }}>
        <Link component={RouterLink} to="/customer/applications" underline="hover">
          My Applications
        </Link>
        <Typography color="text.primary">{application.id}</Typography>
      </Breadcrumbs>
      <PageHeader title={application.id} subtitle={application.carName} action={<StatusChip status={application.status} />} />

      <Stack spacing={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={800} mb={1.5}>
            Application Overview
          </Typography>
          <Stack direction="row" spacing={4} flexWrap="wrap" rowGap={2}>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Assigned Manager
              </Typography>
              <Typography fontWeight={700}>{manager ? manager.name : 'Not yet assigned'}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Vehicle
              </Typography>
              <Typography fontWeight={700}>{application.carName}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Color
              </Typography>
              <Typography fontWeight={700}>{application.color}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Submitted
              </Typography>
              <Typography fontWeight={700}>{new Date(application.createdAt).toLocaleDateString()}</Typography>
            </Stack>
          </Stack>
          {application.status === 'REJECTED' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              This application was rejected. Contact the showroom for details.
            </Alert>
          )}
        </Paper>

        {plan ? (
          <>
            <FinanceSummary plan={plan} totalPaid={totalPaid} />
            <div>
              <Typography variant="h6" fontWeight={800} mb={1.5}>
                Installment Schedule &amp; Payment History
              </Typography>
              <InstallmentTable installments={installments} />
            </div>
          </>
        ) : (
          <Alert severity="info">
            A finance plan will appear here once your assigned Manager sets up your down payment and
            installment schedule.
          </Alert>
        )}
      </Stack>
    </Container>
  );
}
