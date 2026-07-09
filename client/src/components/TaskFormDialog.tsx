import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Button, MenuItem, Stack, Box, CircularProgress,
} from '@mui/material';
import type { TaskItem, TaskStatus } from '../api/tasksApi';
import { tasksApi } from '../api/tasksApi';
import { usersApi } from '../api/UsersApi';
import type { UserSummary } from '../api/UsersApi';
import { useAuth } from '../context/useAuth';

interface Props {
  open: boolean;
  task: TaskItem | null;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; statusId: number; dueDate: string; ownerId?: string }) => Promise<void>;
}

export function TaskFormDialog({ open, task, onClose, onSubmit }: Props) {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* key forces a fresh mount whenever we switch between editing different
          tasks, or between edit and create — this replaces syncing props into
          state via an effect, which is the pattern React recommends instead. */}
      <TaskFormBody key={task?.id ?? 'new'} task={task} onClose={onClose} onSubmit={onSubmit} />
    </Dialog>
  );
}

function TaskFormBody({ task, onClose, onSubmit }: Omit<Props, 'open'>) {
  const { role } = useAuth();
  const isAdmin = role === 'Admin';

  // Initializers run once per mount. Since the parent remounts this component
  // via `key` whenever `task` changes, these always start correctly synced —
  // no effect needed to copy props into state.
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [statusId, setStatusId] = useState(task?.statusId ?? 0);
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split('T')[0] : '');
  const [ownerId, setOwnerId] = useState(task?.ownerId ?? '');

  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Legitimate effect use: subscribes to the API and calls setState only
  // inside the async callback, after data actually arrives — not synchronously
  // in the effect body itself.
  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const statusPromise = tasksApi.getStatuses();
        const usersPromise = isAdmin ? usersApi.list() : Promise.resolve([]);
        const [statusResult, usersResult] = await Promise.all([statusPromise, usersPromise]);
        if (cancelled) return;

        setStatuses(statusResult);
        setUsers(usersResult);

        if (!task && statusResult.length > 0) {
          setStatusId(statusResult[0].id);
        }
      } catch {
        if (!cancelled) setError('Failed to load form options. Please try again.');
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }

    loadOptions();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, task]);

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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save task.';
      const apiMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(apiMessage || message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogTitle>{task ? 'Edit task' : 'New task'}</DialogTitle>
      <DialogContent>
        {loadingOptions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
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
    </>
  );
}