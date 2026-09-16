import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import FinanceSummary from '../../components/finance/FinanceSummary';
import InstallmentTable from '../../components/finance/InstallmentTable';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { FREQUENCIES, APP_STATUS_LABELS } from '../../utils/constants';
import { money } from '../../utils/formatters';
import { getFinancePlanApi, createFinancePlanApi } from '../../services/financeApi';
import { getInstallmentsApi } from '../../services/installmentApi';
import { getPaymentsApi, createPaymentApi } from '../../services/paymentApi';

// The core Manager screen (section 6/18 of the guide): verify the
// customer, select their vehicle, set up down payment + installment
// plan, and record payments — one step at a time, each step only
// unlocked once the previous one is done server-side.
export default function ApplicationWorkflow() {
  const { id } = useParams();
  const nav = useNavigate();
  const { applications, cars, selectVehicle, updateApplication } = useApp();
  const { user } = useAuth();

  const application = applications.find((a) => a.id === id);

  const [plan, setPlan] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loadingFinance, setLoadingFinance] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [vehicleId, setVehicleId] = useState(application?.carId || '');
  const [financeForm, setFinanceForm] = useState({ downPayment: '', duration: 12, frequency: 'Monthly' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'Cash', reference: '' });

  const availableCars = useMemo(() => cars.filter((c) => c.status === 'Available' || c.id === application?.carId), [cars, application]);

  const loadFinance = async () => {
    if (!application || !['FINANCE_SETUP', 'PAYMENT_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OVERDUE', 'COMPLETED'].includes(application.status)) return;
    setLoadingFinance(true);
    try {
      const [p, i, pay] = await Promise.all([
        getFinancePlanApi(application.id),
        getInstallmentsApi(application.id),
        getPaymentsApi(application.id),
      ]);
      setPlan(p);
      setInstallments(i || []);
      setPayments(pay || []);
    } catch {
      /* not set up yet — non-fatal */
    } finally {
      setLoadingFinance(false);
    }
  };

  useEffect(() => {
    loadFinance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application?.status]);

  if (!application) {
    return <Alert severity="warning">Application not found, or it isn't assigned to you.</Alert>;
  }

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const handleVerify = async () => {
    setBusy(true);
    setError('');
    try {
      await updateApplication(application.id, { status: 'IN_PROCESS' }, user.name);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not verify application.');
    } finally {
      setBusy(false);
    }
  };

  const handleSelectVehicle = async () => {
    if (!vehicleId) return;
    setBusy(true);
    setError('');
    try {
      await selectVehicle(application.id, vehicleId, user.name);
      await updateApplication(application.id, { status: 'VEHICLE_SELECTED' }, user.name);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not select vehicle.');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateFinancePlan = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const car = cars.find((c) => c.id === (application.carId || vehicleId));
      const created = await createFinancePlanApi(application.id, {
        vehicleId: car?.id,
        vehiclePrice: car?.sellingPrice,
        downPayment: Number(financeForm.downPayment),
        duration: Number(financeForm.duration),
        frequency: financeForm.frequency,
        performedBy: user.name,
      });
      setPlan(created);
      await updateApplication(application.id, { status: 'FINANCE_SETUP' }, user.name);
      await loadFinance();
    } catch (e2) {
      setError(e2.response?.data?.message || 'Could not create finance plan.');
    } finally {
      setBusy(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await createPaymentApi({
        applicationId: application.id,
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        reference: paymentForm.reference,
        performedBy: user.name,
      });
      if (application.status !== 'PAYMENT_IN_PROGRESS') {
        await updateApplication(application.id, { status: 'PAYMENT_IN_PROGRESS' }, user.name);
      }
      setPaymentForm({ amount: '', method: 'Cash', reference: '' });
      await loadFinance();
    } catch (e2) {
      setError(e2.response?.data?.message || 'Could not record payment.');
    } finally {
      setBusy(false);
    }
  };

  const handleReadyForDelivery = async () => {
    setBusy(true);
    setError('');
    try {
      await updateApplication(application.id, { status: 'READY_FOR_DELIVERY' }, user.name);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not update status.');
    } finally {
      setBusy(false);
    }
  };

  const remaining = plan ? Math.max((plan.financedAmount || 0) - totalPaid, 0):0;

  return (
    <>
      <PageHeader
        title={`Application ${application.id}`}
        subtitle={`${application.fullName} · ${application.phone}`}
        action={<StatusChip status={application.status} />}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={800} mb={2}>
              Customer Details
            </Typography>
            <Stack spacing={1}>
              {[
                ['Full Name', application.fullName],
                ['Email', application.email],
                ['Phone', application.phone],
                ['CNIC', application.cnic],
                ['Address', `${application.address}, ${application.city}`],
                ['Requested Vehicle', application.carName],
                ['Color', application.color],
              ].map(([label, value]) => (
                <Stack key={label} direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">{label}</Typography>
                  <Typography fontWeight={600}>{value || '—'}</Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            {application.status === 'ASSIGNED' && (
              <Button variant="contained" fullWidth disabled={busy} onClick={handleVerify}>
                Verify Customer &amp; Documents
              </Button>
            )}

            {application.status === 'IN_PROCESS' && (
              <Stack spacing={1.5}>
                <Typography fontWeight={700}>Select Vehicle</Typography>
                <TextField select size="small" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                  {availableCars.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.make} {c.model} {c.variant} — {money(c.sellingPrice)}
                    </MenuItem>
                  ))}
                </TextField>
                <Button variant="contained" disabled={busy || !vehicleId} onClick={handleSelectVehicle}>
                  Confirm Vehicle Selection
                </Button>
              </Stack>
            )}

            {['VEHICLE_SELECTED', 'FINANCE_SETUP', 'PAYMENT_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OVERDUE', 'COMPLETED'].includes(
              application.status
            ) && (
              <Chip
                sx={{ mt: 1 }}
                label={`Vehicle confirmed: ${application.carName}`}
                color="success"
                variant="outlined"
              />
            )}
          </Paper>

          {application.status === 'VEHICLE_SELECTED' && (
            <Paper sx={{ p: 3, mt: 3 }} component="form" onSubmit={handleCreateFinancePlan}>
              <Typography variant="h6" fontWeight={800} mb={2}>
                Set Up Finance Plan
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Down Payment"
                  type="number"
                  required
                  value={financeForm.downPayment}
                  onChange={(e) => setFinanceForm({ ...financeForm, downPayment: e.target.value })}
                />
                <TextField
                  label="Duration (installments)"
                  type="number"
                  required
                  value={financeForm.duration}
                  onChange={(e) => setFinanceForm({ ...financeForm, duration: e.target.value })}
                />
                <TextField
                  select
                  label="Frequency"
                  value={financeForm.frequency}
                  onChange={(e) => setFinanceForm({ ...financeForm, frequency: e.target.value })}
                >
                  {FREQUENCIES.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
                </TextField>
                <Alert severity="info">
                  financedAmount and the per-installment amount are calculated and stored by the backend —
                  never trust a total computed only in React (section 18 of the guide).
                </Alert>
                <Button type="submit" variant="contained" disabled={busy}>
                  Create Finance Plan
                </Button>
              </Stack>
            </Paper>
          )}

          {['PAYMENT_IN_PROGRESS', 'OVERDUE'].includes(application.status) && (
            <Paper sx={{ p: 3, mt: 3 }} component="form" onSubmit={handleRecordPayment}>
              <Typography variant="h6" fontWeight={800} mb={2}>
                Record Payment
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Amount"
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
                <TextField
                  select
                  label="Method"
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                >
                  {['Cash', 'Bank Transfer', 'Card', 'Cheque'].map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Reference / Receipt No."
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                />
                <Button type="submit" variant="contained" disabled={busy}>
                  Record Payment
                </Button>
                {remaining <= 0 && plan && (
                  <Button variant="outlined" color="success" disabled={busy} onClick={handleReadyForDelivery}>
                    Mark Ready For Delivery
                  </Button>
                )}
              </Stack>
            </Paper>
          )}

          {application.status === 'READY_FOR_DELIVERY' && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Alert severity="success">
                Fully paid and ready for delivery. Completion is finalized by Super Admin (section 20, status rules).
              </Alert>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={7}>
          <Stack spacing={3}>
            {plan && <FinanceSummary plan={plan} totalPaid={totalPaid} />}
            {plan && (
              <div>
                <Typography variant="h6" fontWeight={800} mb={1.5}>
                  Installment Schedule
                </Typography>
                <InstallmentTable installments={installments} />
              </div>
            )}
            {!plan && !loadingFinance && (
              <Alert severity="info">
                Complete verification, vehicle selection, and finance setup on the left — the schedule and
                summary will appear here automatically (workflow stage: {APP_STATUS_LABELS[application.status]}).
              </Alert>
            )}
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
