import type  { ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1F3A5F 0%, #4A78B0 100%)',
        padding: 2,
      }}
    >
      <Paper elevation={6} sx={{ width: '100%', maxWidth: 400, padding: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChecklistRtlIcon sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            TaskForge
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {subtitle}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>
        {children}
      </Paper>
    </Box>
  );
}