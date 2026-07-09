import axiosClient from './axiosClient';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  roleName: string;
}

export const usersApi = {
  list: () => axiosClient.get<UserSummary[]>('/users').then((r) => r.data),
};