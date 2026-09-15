import { queryOptions } from '@tanstack/react-query';
import { api } from '../lib/api';

export type User = {
  userId: number;
  firstName?: string | null;
  lastName?: string | null;
  age?: number | null;
  emailAddress: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateUser = {
  firstName?: string | null;
  lastName?: string | null;
  age?: number | null;
  emailAddress: string;
};

export type UpdateUser = CreateUser;

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: () => [...userKeys.lists()] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (userId: number) => [...userKeys.details(), userId] as const,
  email: (emailAddress: string) => [...userKeys.all, 'email', emailAddress] as const,
};

export function getUsers() {
  return api<User[]>('/users');
}

export function getUserById(userId: number) {
  return api<User>(`/users/${userId}`);
}

export function getUserByEmail(emailAddress: string) {
  return api<User>(`/users/email/${encodeURIComponent(emailAddress)}`);
}

export function postUser(body: CreateUser) {
  return api<User>('/users', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function putUser(userId: number, body: UpdateUser) {
  return api<User>(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteUser(userId: number) {
  return api<void>(`/users/${userId}`, { method: 'DELETE' });
}

export const usersQuery = () =>
  queryOptions({
    queryKey: userKeys.list(),
    queryFn: getUsers,
  });

export const userQuery = (userId: number) =>
  queryOptions({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUserById(userId),
  });

export const userByEmailQuery = (emailAddress: string) =>
  queryOptions({
    queryKey: userKeys.email(emailAddress),
    queryFn: () => getUserByEmail(emailAddress),
  });
