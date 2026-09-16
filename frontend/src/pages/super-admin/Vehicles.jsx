import { useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Checkbox,
  FormControlLabel,
  Chip,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { useApp } from '../../context/AppContext';
import { COLORS, FUEL, STATUS, TRANSMISSION } from '../../utils/constants';
import { money } from '../../utils/formatters';
import { margin, marginLabel } from '../../utils/calculations';
import { validateCar } from '../../utils/validators';
import { uploadCarImagesApi, resolveImageUrl } from '../../services/carApi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import SearchBar from '../../components/common/SearchBar';

const empty = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  variant: '',
  purchaseRate: '',
  sellingPrice: '',
  stock: 0,
  fuel: 'Petrol',
  transmission: 'Automatic',
  mileage: '',
  engine: '',
  description: '',
  status: 'Available',
  supplierId: '',
  colors: ['White'],
  images: [],
  // Drives the customer-facing "Featured Vehicles" section
  // (pages/customer/Dashboard.jsx / Showroom.jsx).
  featured: false,
};

export default function Cars() {
  const { cars, suppliers, saveCar, deleteCar } = useApp();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState({ fuel: '', status: '', supplier: '', year: '', color: '' });
  const [sort, setSort] = useState('');
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const rows = useMemo(() => {
    let x = cars.filter((c) =>
      `${c.id} ${c.make} ${c.model} ${c.variant}`.toLowerCase().includes(q.toLowerCase())
    );
    if (filter.fuel) x = x.filter((c) => c.fuel === filter.fuel);
    if (filter.status) x = x.filter((c) => c.status === filter.status);
    if (filter.supplier) x = x.filter((c) => c.supplierId === filter.supplier);
    if (filter.year) x = x.filter((c) => String(c.year) === filter.year);
    if (filter.color) x = x.filter((c) => c.colors.includes(filter.color));
    if (sort) x = [...x].sort((a, b) => Number(b[sort]) - Number(a[sort]));
    return x;
  }, [cars, q, filter, sort]);

  const openNew = () => {
    setForm(empty);
    setEditing(false);
    setErrors({});
    setUploadError('');
    setOpen(true);
  };

  const openEdit = (c) => {
    setForm({ ...empty, ...c });
    setEditing(true);
    setErrors({});
    setUploadError('');
    setOpen(true);
  };

  const submit = (e) => {
    e.preventDefault();
    const er = validateCar(form);
    setErrors(er);
    if (Object.keys(er).length) return;
    saveCar(
      {
        ...form,
        purchaseRate: Number(form.purchaseRate),
        sellingPrice: Number(form.sellingPrice),
        stock: Number(form.stock),
        featured: !!form.featured,
      },
      'Current Staff'
    );
    setOpen(false);
  };

  // "Choose from desktop" — picks image files from the admin's
  // machine, uploads them to the backend (multer -> disk -> Postgres
  // stores the returned URL), and appends the resulting URLs to the
  // form's images array. The car itself is only saved when the admin
  // clicks "Save Car", same as every other field.
  const handleFilesPicked = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    setUploading(true);
    setUploadError('');
    try {
      const urls = await uploadCarImagesApi(files);
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Image upload failed. Try a smaller file or different format.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (url) => {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  };

  return (
    <>
      <PageHeader
        title="Cars & Inventory"
        subtitle="Complete CRUD, search, filtering, sorting and profit logic"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
            Add Car
          </Button>
        }
      />

      <Stack spacing={2} mb={2}>
        <SearchBar value={q} onChange={setQ} placeholder="Search by ID, make, model or variant" />
        <Grid container spacing={1}>
          {[
            ['fuel', FUEL],
            ['status', Object.values(STATUS)],
            ['supplier', suppliers.map((s) => s.id)],
            ['color', COLORS],
          ].map(([k, opts]) => (
            <Grid item xs={6} md={2} key={k}>
              <TextField
                select
                fullWidth
                size="small"
                label={k}
                value={filter[k]}
                onChange={(e) => setFilter({ ...filter, [k]: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {opts.map((o) => (
                  <MenuItem key={o} value={o}>
                    {k === 'supplier' ? suppliers.find((s) => s.id === o)?.company : o}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          ))}
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Year"
              value={filter.year}
              onChange={(e) => setFilter({ ...filter, year: e.target.value })}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="sellingPrice">Price</MenuItem>
              <MenuItem value="year">Year</MenuItem>
              <MenuItem value="stock">Stock</MenuItem>
              <MenuItem value="purchaseRate">Purchase</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Stack>

      <Paper sx={{ overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['', 'ID', 'Vehicle', 'Price', 'Profit', 'Stock', 'Supplier', 'Status', 'Actions'].map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Box
                    component="img"
                    src={resolveImageUrl(c.images?.[0]) || undefined}
                    alt=""
                    sx={{
                      width: 56,
                      height: 40,
                      objectFit: 'cover',
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      display: c.images?.[0] ? 'block' : 'none',
                    }}
                  />
                </TableCell>
                <TableCell>{c.id}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <b>
                      {c.make} {c.model}
                    </b>
                    {c.featured && (
                      <Tooltip title="Shown in Featured Vehicles on the customer site">
                        <StarRoundedIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                      </Tooltip>
                    )}
                  </Stack>
                  <br />
                  <small>
                    {c.year} • {c.variant}
                  </small>
                </TableCell>
                <TableCell>{money(c.sellingPrice)}</TableCell>
                <TableCell>
                  {money(c.sellingPrice - c.purchaseRate)}
                  <br />
                  <small>
                    {marginLabel(margin(c.sellingPrice, c.purchaseRate))}{' '}
                    {margin(c.sellingPrice, c.purchaseRate).toFixed(1)}%
                  </small>
                </TableCell>
                <TableCell>{c.stock}</TableCell>
                <TableCell>{suppliers.find((s) => s.id === c.supplierId)?.company || '—'}</TableCell>
                <TableCell>
                  <StatusChip status={c.status} />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => openEdit(c)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => setConfirm(c)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <ConfirmDialog
        open={!!confirm}
        message={`Delete ${confirm?.make} ${confirm?.model}? This cannot be undone.`}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          deleteCar(confirm.id, 'Current Staff');
          setConfirm(null);
        }}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Car' : 'Add Car'}</DialogTitle>
        <form onSubmit={submit}>
          <DialogContent>
            <Grid container spacing={2}>
              {[
                ['make', 'Make'],
                ['model', 'Model'],
                ['variant', 'Variant'],
                ['year', 'Year'],
                ['purchaseRate', 'Purchase Rate (PKR)'],
                ['sellingPrice', 'Selling Price (PKR)'],
                ['stock', 'Stock'],
                ['mileage', 'Mileage'],
                ['engine', 'Engine'],
                ['description', 'Description'],
              ].map(([k, l]) => (
                <Grid item xs={12} sm={k === 'description' ? 12 : 6} key={k}>
                  <TextField
                    fullWidth
                    label={l}
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    error={!!errors[k]}
                    helperText={errors[k]}
                    multiline={k === 'description'}
                  />
                </Grid>
              ))}

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Fuel"
                  value={form.fuel}
                  onChange={(e) => setForm({ ...form, fuel: e.target.value })}
                >
                  {FUEL.map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Transmission"
                  value={form.transmission}
                  onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                >
                  {TRANSMISSION.map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {Object.values(STATUS).map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Supplier"
                  value={form.supplierId}
                  onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                >
                  {suppliers.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.company}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Typography fontWeight={700}>Available Colors</Typography>
                {COLORS.map((c) => (
                  <FormControlLabel
                    key={c}
                    control={
                      <Checkbox
                        checked={form.colors.includes(c)}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            colors: e.target.checked
                              ? [...new Set([...form.colors, c])]
                              : form.colors.filter((x) => x !== c),
                          })
                        }
                      />
                    }
                    label={c}
                  />
                ))}
                {errors.colors && <Alert severity="error">{errors.colors}</Alert>}
              </Grid>

              {/* ── Photos: choose from desktop, uploads to the backend, stored in Postgres as URLs ── */}
              <Grid item xs={12}>
                <Typography fontWeight={700} mb={1}>
                  Photos
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                  multiple
                  hidden
                  onChange={handleFilesPicked}
                />
                <Button
                  variant="outlined"
                  startIcon={uploading ? <CircularProgress size={16} /> : <UploadFileRoundedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading…' : 'Choose from desktop'}
                </Button>
                {uploadError && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {uploadError}
                  </Alert>
                )}
                {!!form.images.length && (
                  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap mt={2}>
                    {form.images.map((url, i) => (
                      <Box key={url} sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={resolveImageUrl(url)}
                          alt={`Car photo ${i + 1}`}
                          sx={{
                            width: 100,
                            height: 72,
                            objectFit: 'cover',
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        />
                        {i === 0 && (
                          <Chip
                            label="Cover"
                            size="small"
                            sx={{ position: 'absolute', bottom: 4, left: 4, height: 18, fontSize: 10 }}
                          />
                        )}
                        <IconButton
                          size="small"
                          onClick={() => removeImage(url)}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { bgcolor: 'error.main', color: '#fff' },
                          }}
                        >
                          <CloseRoundedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                )}
                {!form.images.length && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    No photos yet — the first photo uploaded is used as the cover image everywhere on the site.
                  </Typography>
                )}
              </Grid>

              {/* ── Show as Featured ── */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    />
                  }
                  label="Show as Featured (appears in the Featured Vehicles section on the customer site)"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={uploading}>
              Save Car
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
