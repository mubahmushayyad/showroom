import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper,
  Stack,
  Alert,
  Typography,
  Container,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { validateApplication } from "../../utils/validators";
import { generateId } from "../../services/localStorageService";

export default function ApplyForCar() {
  const { id } = useParams();
  const nav = useNavigate();
  const { cars, saveApplication, customers } = useApp();
  const { user } = useAuth();
  const c = cars.find((x) => x.id === id);
  const customer = customers.find((x) => x.userId === user.id) || {};
  const [form, setForm] = useState({
    fullName: customer.name || user.name,
    email: customer.email || user.email,
    cnic: customer.cnic || "",
    phone: customer.phone || "",
    address: customer.address || "",
    city: customer.city || "",
    carId: c?.id || "",
    color: c?.colors?.[0] || "",
    notes: "",
  });
  const [err, setErr] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState("");

  if (!c) return <Typography>Vehicle not found.</Typography>;

  // Step 1 of the Application-to-Delivery flow (section 1/8 of the
  // guide): Customer submits → status starts at PENDING and waits for
  // Super Admin review (Approve/Pending/Reject) before anything else happens.
  const submit = async (e) => {
    e.preventDefault();
    const x = validateApplication(form);
    setErr(x);
    if (Object.keys(x).length) return;

    setSubmitting(true);
    try {
      const app = await saveApplication(
        {
          ...form,
          id: generateId("APP"),
          userId: user.id,
          carName: `${c.make} ${c.model} ${c.variant}`,
          carImage: c.images?.[0],
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
        user.name,
      );
      setDone(app.id);
    } finally {
      setSubmitting(false);
    }
  };

  if (done)
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
        <Paper sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h4" fontWeight={900}>
            Application Submitted
          </Typography>
          <Typography mt={1}>
            Your application/order ID is <b>{done}</b>. A Super Admin will
            review it and, once approved, assign you a dedicated Manager.
          </Typography>
          <Button
            sx={{ mt: 3 }}
            variant="contained"
            onClick={() => nav("/customer/applications")}
          >
            View My Applications
          </Button>
        </Paper>
      </Container>
    );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <PageHeader
        title="Apply for Car"
        subtitle={`Applying for ${c.make} ${c.model} ${c.variant}`}
      />
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <form onSubmit={submit}>
          <Grid container spacing={2}>
            {[
              ["fullName", "Full Name"],
              ["email", "Email"],
              ["cnic", "CNIC"],
              ["phone", "Cell Number"],
              ["address", "Current Address"],
              ["city", "City"],
            ].map(([k, l]) => (
              <Grid item xs={12} sm={6} key={k}>
                <TextField
                  fullWidth
                  label={l}
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  error={!!err[k]}
                  helperText={err[k]}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Selected Car"
                value={`${c.make} ${c.model} ${c.variant}`}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Selected Color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                error={!!err.color}
                helperText={err.color}
              >
                {c.colors.map((x) => (
                  <MenuItem key={x} value={x}>
                    {x}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Notes (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Selected vehicle: {c.make} {c.model}. Available colors only:{" "}
                {c.colors.join(", ")}.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" size="large" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Application"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
