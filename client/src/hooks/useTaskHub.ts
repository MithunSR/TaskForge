import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import type { TaskItem } from '../api/tasksApi';

interface Handlers {
  onTaskCreated: (task: TaskItem) => void;
  onTaskUpdated: (task: TaskItem) => void;
  onTaskDeleted: (payload: { taskId: string; ownerId: string }) => void;
}

export function useTaskHub(handlers: Handlers) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}/hubs/tasks`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.on('TaskCreated', handlers.onTaskCreated);
    connection.on('TaskUpdated', handlers.onTaskUpdated);
    connection.on('TaskDeleted', handlers.onTaskDeleted);

    connection.start().catch((err) => console.error('SignalR connection failed:', err));
    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}