import { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography,  Box, Container, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, IconButton, CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import { useNavigate } from 'react-router-dom';
import { usersApi} from '../api/UsersApi';
import type { UserSummary } from '../api/UsersApi';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.list().then(setUsers).finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'primary.main' }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <ChecklistRtlIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>TaskForge — Users</Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>User management</Typography>

        {loading ? (
          <CircularProgress sx={{ mt: 4 }} />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.roleName} size="small" color={u.roleName === 'Admin' ? 'primary' : 'default'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Container>
    </Box>
  );
}