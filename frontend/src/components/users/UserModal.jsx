import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import UserForm from './UserForm';

export default function UserModal({ open, editing, form, errors, loading, onChange, onClose, onSubmit }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Edit User' : 'Add User'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <UserForm form={form} errors={errors} onChange={onChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {editing ? 'Update User' : 'Add User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
