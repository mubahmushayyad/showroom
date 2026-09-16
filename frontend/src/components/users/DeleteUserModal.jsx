import ConfirmDialog from '../common/ConfirmDialog';

export default function DeleteUserModal({ user, onClose, onConfirm }) {
  return (
    <ConfirmDialog
      open={!!user}
      title="Delete user"
      message={`Delete ${user?.name}? This cannot be undone.`}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
