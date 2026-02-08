import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
});

export const queryKeys = {
  auth: ['auth'] as const,
  user: (id: number) => ['user', id] as const,
  forums: ['forums'] as const,
  forum: (id: number) => ['forum', id] as const,
  threads: (forumId: number) => ['threads', forumId] as const,
  thread: (id: number) => ['thread', id] as const,
};
