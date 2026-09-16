import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { DEMO_LOGIN_HINTS, HOME_ROUTE } from "../../utils/constants";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("superadmin@udevs.com");
  const [password, setPassword] = useState("SuperAdmin@123");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const u = await login(email, password);
      nav(HOME_ROUTE[u.role] || "/customer");
    } catch (error) {
      setErr(error.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ background: "linear-gradient(135deg,#071a2f,#0b5fa5)" }}
      p={2}
    >
      <Paper
        sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 520,
          borderRadius: 4,
        }}
      >
        <Stack spacing={2}>
          <Box textAlign="center">
            <DirectionsCarIcon sx={{ fontSize: 55 }} />
            <Typography variant="h4" fontWeight={900}>
              U Devs Showroom Management
            </Typography>
            <Typography color="text.secondary">
              Super Admin → Admin → Manager → Customer
            </Typography>
          </Box>
          {err && <Alert severity="error">{err}</Alert>}
          <form onSubmit={submit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
              <Button type="submit" size="large" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Sign in"}
              </Button>
            </Stack>
          </form>
          <Typography variant="subtitle2">Demo accounts (seed via `npm run db:seed` in /backend)</Typography>
          <Stack spacing={0.5}>
            {DEMO_LOGIN_HINTS.map(({ role, email: e, password: p }) => (
              <Chip
                key={role}
                label={`${role}: ${e} / ${p}`}
                onClick={() => {
                  setEmail(e);
                  setPassword(p);
                }}
                variant="outlined"
                sx={{
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
