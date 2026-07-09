import { useState, useEffect, useCallback } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Chip, Container, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton, Select, MenuItem, Stack, Pagination,
  CircularProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { tasksApi } from '../api/tasksApi';
import type { TaskItem, TaskStatus } from '../api/tasksApi';
import { usersApi } from '../api/UsersApi';
import type { UserSummary } from '../api/UsersApi';
import { TaskFormDialog } from '../components/TaskFormDialog';
import { DeleteConfirmDialog } from '../components/DeleteConfirmationDialog';
import { STATUS_COLORS } from '../constants/taskStatusColors';
import { useTaskHub } from '../hooks/useTaskHub';

export default function Dashboard() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = role === 'Admin';

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [ownerFilter, setOwnerFilter] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);


  useTaskHub({
    onTaskCreated: (task) => {
      // Only add it to the visible list if it matches current filters/ownership
      setTasks((prev) => {
        const alreadyThere = prev.some((t) => t.id === task.id);
        return alreadyThere ? prev : [task, ...prev];
      });
    },
    onTaskUpdated: (task) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    },
    onTaskDeleted: ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    },
  });

  // Load filter option lists once (statuses always; users only if Admin)
  useEffect(() => {
    tasksApi.getStatuses().then(setStatuses).catch(() => {});
    if (isAdmin) {
      usersApi.list().then(setUsers).catch(() => {});
    }
  }, [isAdmin]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await tasksApi.list({
        page,
        pageSize: 10,
        statusId: statusFilter || undefined,
        // Owner filter only ever sent if Admin — for a standard User this control
        // doesn't even render, and the backend forces their own ID regardless.
        ownerId: isAdmin && ownerFilter ? ownerFilter : undefined,
      });
      setTasks(result.items);
      setTotalPages(result.totalPages || 1);
    } catch {
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, ownerFilter, isAdmin]);

 useEffect(() => {
  function run() {
    loadTasks();
  }
  run();
}, [loadTasks]);
  const handleSave = async (data: { title: string; description: string; statusId: number; dueDate: string; ownerId?: string }) => {
    if (editingTask) {
      await tasksApi.update(editingTask.id, data);
    } else {
      await tasksApi.create(data);
    }
    await loadTasks();
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    await tasksApi.remove(deletingTask.id);
    setDeletingTask(null);
    await loadTasks();
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'primary.main' }}>
        <Toolbar>
          <ChecklistRtlIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>TaskForge</Typography>

          {/* RBAC: only Admins see the user management link */}
          {isAdmin && (
            <Button color="inherit" startIcon={<PeopleAltIcon />} onClick={() => navigate('/admin/users')} sx={{ mr: 1 }}>
              Users
            </Button>
          )}

          <Chip label={role ?? ''} size="small" sx={{ mr: 2, backgroundColor: 'secondary.main', color: 'white' }} />
          <Button color="inherit" onClick={logout}>Log out</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Your tasks</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingTask(null); setFormOpen(true); }}>
            New task
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as number | ''); setPage(1); }}
            displayEmpty
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {statuses.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </Select>

          {/* RBAC: owner filter only rendered for Admins — a standard User has no use for it,
              since the backend already restricts them to only their own tasks. */}
          {isAdmin && (
            <Select
              size="small"
              value={ownerFilter}
              onChange={(e) => { setOwnerFilter(e.target.value); setPage(1); }}
              displayEmpty
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All owners</MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
              ))}
            </Select>
          )}
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ py: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : tasks.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No tasks found. Create your first task to get started.
          </Typography>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} hover>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <Chip label={task.statusName} size="small" color={STATUS_COLORS[task.statusName] ?? 'default'} />
                    </TableCell>
                    <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => { setEditingTask(task); setFormOpen(true); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeletingTask(task)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
            </Box>
          </>
        )}
      </Container>

      <TaskFormDialog
        open={formOpen}
        task={editingTask}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
      />

      <DeleteConfirmDialog
        open={!!deletingTask}
        taskTitle={deletingTask?.title}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}