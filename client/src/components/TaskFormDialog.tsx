import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Button, MenuItem, Stack, Box, CircularProgress,
} from '@mui/material';
import type { TaskItem, TaskStatus } from '../api/tasksApi';
import { tasksApi } from '../api/tasksApi';
import { usersApi} from '../api/UsersApi';
import type { UserSummary } from '../api/UsersApi';
import { useAuth } from '../context/useAuth';

interface Props {
  open: boolean;
  task: TaskItem | null;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; statusId: number; dueDate: string; ownerId?: string }) => Promise<void>;
}

export function TaskFormDialog({ open, task, onClose, onSubmit }: Props) {
  const { role } = useAuth();
  const isAdmin = role === 'Admin';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [ownerId, setOwnerId] = useState('');

  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dropdown options fresh every time the dialog opens
  useEffect(() => {
    if (!open) return;
    setLoadingOptions(true);
    setError(null);

    const loadPromises: Promise<void>[] = [
      tasksApi.getStatuses().then(setStatuses),
    ];

    if (isAdmin) {
      loadPromises.push(usersApi.list().then(setUsers));
    }

    Promise.all(loadPromises)
      .catch(() => setError('Failed to load form options. Please try again.'))
      .finally(() => setLoadingOptions(false));
  }, [open, isAdmin]);

  // Populate fields when editing, reset when creating
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setStatusId(task.statusId);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setOwnerId(task.ownerId);
    } else {
      setTitle('');
      setDescription('');
      setStatusId(0);
      setDueDate('');
      setOwnerId('');
    }
  }, [task, open]);

  // Default statusId to the first available status once statuses load, for new tasks
  useEffect(() => {
    if (!task && statuses.length > 0 && statusId === 0) {
      setStatusId(statuses[0].id);
    }
  }, [statuses, task, statusId]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title,
        description,
        statusId,
        dueDate,
        // Only send ownerId if Admin explicitly picked someone — otherwise the
        // backend defaults to the current user, which is the correct behavior
        // for both standard Users (who can never override this) and Admins
        // creating a task for themselves.
        ownerId: isAdmin && ownerId ? ownerId : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{task ? 'Edit task' : 'New task'}</DialogTitle>
      <DialogContent>
        {loadingOptions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <TextField error helperText={error} sx={{ display: 'none' }} />}
            {error && <div style={{ color: '#d32f2f', fontSize: 14 }}>{error}</div>}

            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              autoFocus
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              select
              label="Status"
              value={statusId || ''}
              onChange={(e) => setStatusId(Number(e.target.value))}
              fullWidth
              required
            >
              {statuses.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Due date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              fullWidth
            />

            {/* RBAC: only Admins can assign ownership, and only when creating a new task */}
            {isAdmin && !task && (
              <TextField
                select
                label="Owner (defaults to you)"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Myself</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.name} ({u.email})</MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || loadingOptions || !title || !statusId}
        >
          {saving ? 'Saving…' : 'Save task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}