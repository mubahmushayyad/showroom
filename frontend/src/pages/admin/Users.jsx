import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Alert, Collapse } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../../components/common/PageHeader';
import UserTable from '../../components/users/UserTable';
import UserModal from '../../components/users/UserModal';
import DeleteUserModal from '../../components/users/DeleteUserModal';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../../redux/users/userActions';
import {
  selectUsers,
  selectUsersLoading,
  selectUsersError,
  selectUsersSuccess,
} from '../../redux/users/userSelectors';
import { clearUserError, clearUserSuccess } from '../../redux/users/userSlice';
import { validateUser } from '../../utils/validators';
import { generateId } from '../../services/localStorageService';

const empty = { name: '', email: '', role: 'Customer', status: 'Active' };

export default function Users() {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);
  const success = useSelector(selectUsersSuccess);

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => dispatch(clearUserSuccess()), 2500);
      return () => clearTimeout(t);
    }
  }, [success, dispatch]);

  const openAdd = () => {
    setForm(empty);
    setErrors({});
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setForm(user);
    setErrors({});
    setEditing(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    dispatch(clearUserError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validateUser(form, users, editing?.id);
    setErrors(v);
    if (Object.keys(v).length) return;

    if (editing) {
      dispatch(updateUser({ id: editing.id, payload: form })).then((res) => {
        if (!res.error) setModalOpen(false);
      });
    } else {
      const payload = {
        ...form,
        id: generateId('USR'),
        createdAt: new Date().toISOString(),
      };
      dispatch(createUser(payload)).then((res) => {
        if (!res.error) setModalOpen(false);
      });
    }
  };

  const confirmDelete = () => {
    dispatch(deleteUser(pendingDelete.id));
    setPendingDelete(null);
  };

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Manage admin and staff accounts via the Redux + Axios user module"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
            Add User
          </Button>
        }
      />

      <Collapse in={!!error}>
        <Alert severity="error" onClose={() => dispatch(clearUserError())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Collapse>
      <Collapse in={success}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Operation successful
        </Alert>
      </Collapse>

      <UserTable users={users} loading={loading} onEdit={openEdit} onDelete={setPendingDelete} />

      <UserModal
        open={modalOpen}
        editing={!!editing}
        form={form}
        errors={errors}
        loading={loading}
        onChange={setForm}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <DeleteUserModal
        user={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
