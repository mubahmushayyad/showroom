import { TextField } from '@mui/material';
export default function SearchBar({ value, onChange, placeholder = 'Search...', sx }) {
  return (
    <TextField
      size="small"
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      sx={sx}
    />
  );
}
