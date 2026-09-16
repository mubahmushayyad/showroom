import { Stack, TextField, MenuItem, Grid, Typography, Button, Box } from '@mui/material';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import { ROLES } from '../../utils/constants';

const roleOptions = Object.values(ROLES);

// Section 4/19 of the guide — Super Admin registers users with
// First/Last Name, Email, Phone, CNIC, CNIC Front/Back, Role, Status.
// `firstName`/`lastName` are kept alongside the legacy `name` field
// (auto-combined) so this still works against the existing /api/users
// contract while matching the PDF's registration form fields.
export default function UserForm({ form, errors, onChange }) {
  const set = (key) => (e) => {
    const value = e.target.value;
    const next = { ...form, [key]: value };
    if (key === 'firstName' || key === 'lastName') {
      next.name = `${next.firstName || ''} ${next.lastName || ''}`.trim();
    }
    onChange(next);
  };

  const setFile = (key) => (e) => {
    const file = e.target.files?.[0];
    if (file) onChange({ ...form, [key]: file });
  };

  return (
    <Stack spacing={2} mt={1}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="First Name"
            value={form.firstName || ''}
            onChange={set('firstName')}
            error={!!errors.name}
            fullWidth
            autoFocus
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Last Name" value={form.lastName || ''} onChange={set('lastName')} fullWidth />
        </Grid>
      </Grid>

      <TextField
        label="Email"
        type="email"
        value={form.email || ''}
        onChange={set('email')}
        error={!!errors.email}
        helperText={errors.email}
        fullWidth
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Phone (03XXXXXXXXX)"
            value={form.phone || ''}
            onChange={set('phone')}
            error={!!errors.phone}
            helperText={errors.phone}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="CNIC (35202-1234567-1)"
            value={form.cnic || ''}
            onChange={set('cnic')}
            error={!!errors.cnic}
            helperText={errors.cnic}
            fullWidth
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {[
          ['cnicFrontFile', 'CNIC Front'],
          ['cnicBackFile', 'CNIC Back'],
        ].map(([key, label]) => (
          <Grid item xs={12} sm={6} key={key}>
            <Button component="label" variant="outlined" fullWidth startIcon={<UploadFileRoundedIcon />}>
              {label}
              <input hidden type="file" accept="image/*,.pdf" onChange={setFile(key)} />
            </Button>
            {form[key] && (
              <Typography variant="caption" color="text.secondary" noWrap display="block" mt={0.5}>
                {form[key].name || 'File attached'}
              </Typography>
            )}
          </Grid>
        ))}
      </Grid>

      <TextField
        select
        label="Role"
        value={form.role || ''}
        onChange={set('role')}
        error={!!errors.role}
        helperText={errors.role}
        fullWidth
      >
        {roleOptions.map((r) => (
          <MenuItem key={r} value={r}>
            {r}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Status"
        value={form.status || 'Active'}
        onChange={set('status')}
        error={!!errors.status}
        helperText={errors.status}
        fullWidth
      >
        <MenuItem value="Active">Active</MenuItem>
        <MenuItem value="Inactive">Inactive</MenuItem>
      </TextField>
      <Box sx={{ display: 'none' }}>{/* keeps `name` in sync, see set() above */}</Box>
    </Stack>
  );
}
