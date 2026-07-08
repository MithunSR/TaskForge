import { AppBar, Toolbar, Typography, Button, Box, Chip, Container } from '@mui/material';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { role, logout } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'primary.main' }}>
        <Toolbar>
          <ChecklistRtlIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            TaskForge
          </Typography>
          <Chip label={role ?? ''} size="small" sx={{ mr: 2, backgroundColor: 'secondary.main', color: 'white' }} />
          <Button color="inherit" onClick={logout}>
            Log out
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Your tasks
        </Typography>
        <Typography color="text.secondary">
          Task list coming next — filters, pagination, and live updates land here.
        </Typography>
      </Container>
    </Box>
  );
}