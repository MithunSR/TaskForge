import type { ChipProps } from '@mui/material';

export const STATUS_COLORS: Record<string, ChipProps['color']> = {
  Todo: 'default',
  InProgress: 'warning',
  Done: 'success',
};