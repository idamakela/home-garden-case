import { useQuery } from '@tanstack/react-query';
import { gardensQuery } from '../gardens';

export function useGardens(options?: { refetchInterval?: false }) {
  return useQuery({ ...gardensQuery(), ...options });
}
