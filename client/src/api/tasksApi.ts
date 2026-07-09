import axiosClient from './axiosClient';

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  statusId: number;
  statusName: string;
  dueDate: string | null;
  ownerId: string;
}

export interface TaskStatus {
  id: number;
  name: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  statusId: number;
  dueDate?: string;
  ownerId?: string;
}

export interface UpdateTaskPayload {
  title: string;
  description?: string;
  statusId: number;
  dueDate?: string;
}

export const tasksApi = {
  getStatuses: () => axiosClient.get<TaskStatus[]>('/tasks/statuses').then((r) => r.data),

  list: (params: { page: number; pageSize: number; statusId?: number; ownerId?: string }) =>
    axiosClient.get<PagedResult<TaskItem>>('/tasks', { params }).then((r) => r.data),

  getById: (id: string) => axiosClient.get<TaskItem>(`/tasks/${id}`).then((r) => r.data),

  create: (data: CreateTaskPayload) => axiosClient.post<TaskItem>('/tasks', data).then((r) => r.data),

  update: (id: string, data: UpdateTaskPayload) => axiosClient.put(`/tasks/${id}`, data),

  remove: (id: string) => axiosClient.delete(`/tasks/${id}`),
};