import { vi } from 'vitest';

// Mock Supabase client for testing
export const createMockSupabaseClient = () => {
  const mockFrom = vi.fn().mockReturnThis();
  const mockSelect = vi.fn().mockReturnThis();
  const mockInsert = vi.fn().mockReturnThis();
  const mockUpdate = vi.fn().mockReturnThis();
  const mockDelete = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockReturnThis();
  const mockIlike = vi.fn().mockReturnThis();
  const mockIn = vi.fn().mockReturnThis();
  const mockSingle = vi.fn().mockReturnThis();

  const mockStorage = {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({
        data: { path: 'photos/test-image.jpg' },
        error: null,
      }),
      remove: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/test-image.jpg' },
      }),
    }),
  };

  const mockAuth = {
    getUser: vi.fn().mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
        },
      },
      error: null,
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
        },
      },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({
      error: null,
    }),
  };

  return {
    from: mockFrom,
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    order: mockOrder,
    limit: mockLimit,
    ilike: mockIlike,
    in: mockIn,
    single: mockSingle,
    storage: mockStorage,
    auth: mockAuth,
  };
};

// Mock the supabase client module
vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient(),
}));
