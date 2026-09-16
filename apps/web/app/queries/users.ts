import { queryOptions } from '@tanstack/react-query';
import { api } from '../lib/api';
import { userQueryKeys } from './users.const';

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
    queryKey: userQueryKeys.list(),
    queryFn: getUsers,
  });

export const userQuery = (userId: number) =>
  queryOptions({
    queryKey: userQueryKeys.detail(userId),
    queryFn: () => getUserById(userId),
  });

export const userByEmailQuery = (emailAddress: string) =>
  queryOptions({
    queryKey: userQueryKeys.email(emailAddress),
    queryFn: () => getUserByEmail(emailAddress),
  });
