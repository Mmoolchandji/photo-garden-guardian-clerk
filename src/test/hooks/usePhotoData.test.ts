import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePhotoData } from '@/hooks/usePhotoData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Mock dependencies
vi.mock('@/integrations/supabase/client');
vi.mock('@/contexts/AuthContext');
vi.mock('@/components/ui/use-toast');

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
};

const mockPhotos = [
  {
    id: '1',
    title: 'Test Photo 1',
    description: 'A test photo',
    fabric: 'Cotton',
    image_url: 'https://example.com/photo1.jpg',
    created_at: '2024-01-01T00:00:00Z',
    user_id: 'user-1',
    sort_order: 1,
  },
  {
    id: '2',
    title: 'Test Photo 2',
    description: 'Another test photo',
    fabric: 'Silk',
    image_url: 'https://example.com/photo2.jpg',
    created_at: '2024-01-02T00:00:00Z',
    user_id: 'user-1',
    sort_order: 2,
  },
];

describe('usePhotoData CRUD Operations', () => {
  const mockToast = vi.fn();
  const mockSupabaseQuery = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useAuth as any).mockReturnValue({
      user: mockUser,
      authReady: true,
    });
    
    (useToast as any).mockReturnValue({
      toast: mockToast,
    });
    
    (supabase.from as any).mockReturnValue(mockSupabaseQuery);
  });

  describe('READ Operations', () => {
    it('should fetch photos successfully', async () => {
      mockSupabaseQuery.eq.mockResolvedValueOnce({
        data: mockPhotos,
        error: null,
      });

      const { result } = renderHook(() => 
        usePhotoData({
          search: '',
          fabrics: [],
          stockStatuses: [],
          priceRange: null,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.photos).toEqual(mockPhotos);
      expect(supabase.from).toHaveBeenCalledWith('photos');
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('user_id', mockUser.id);
    });

    it('should handle search filtering', async () => {
      const searchTerm = 'Cotton';
      mockSupabaseQuery.eq.mockResolvedValueOnce({
        data: [mockPhotos[0]],
        error: null,
      });

      renderHook(() => 
        usePhotoData({
          search: searchTerm,
          fabrics: [],
          stockStatuses: [],
          priceRange: null,
        })
      );

      await waitFor(() => {
        expect(mockSupabaseQuery.or).toHaveBeenCalledWith(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      });
    });

    it('should handle fabric filtering', async () => {
      const fabrics = ['Cotton', 'Silk'];
      mockSupabaseQuery.eq.mockResolvedValueOnce({
        data: mockPhotos,
        error: null,
      });

      renderHook(() => 
        usePhotoData({
          search: '',
          fabrics,
          stockStatuses: [],
          priceRange: null,
        })
      );

      await waitFor(() => {
        expect(mockSupabaseQuery.in).toHaveBeenCalledWith('fabric', fabrics);
      });
    });

    it('should handle price range filtering', async () => {
      mockSupabaseQuery.eq.mockResolvedValueOnce({
        data: mockPhotos,
        error: null,
      });

      renderHook(() => 
        usePhotoData({
          search: '',
          fabrics: [],
          stockStatuses: [],
          priceRange: '300-500',
        })
      );

      await waitFor(() => {
        expect(mockSupabaseQuery.gte).toHaveBeenCalledWith('price', 300);
        expect(mockSupabaseQuery.lte).toHaveBeenCalledWith('price', 500);
      });
    });

    it('should handle fetch errors gracefully', async () => {
      const errorMessage = 'Database connection failed';
      mockSupabaseQuery.eq.mockResolvedValueOnce({
        data: null,
        error: new Error(errorMessage),
      });

      const { result } = renderHook(() => 
        usePhotoData({
          search: '',
          fabrics: [],
          stockStatuses: [],
          priceRange: null,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error loading photos",
        description: errorMessage,
        variant: "destructive",
      });
    });

    it('should return empty array when user is not authenticated', async () => {
      (useAuth as any).mockReturnValue({
        user: null,
        authReady: true,
      });

      const { result } = renderHook(() => 
        usePhotoData({
          search: '',
          fabrics: [],
          stockStatuses: [],
          priceRange: null,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.photos).toEqual([]);
    });
  });

  describe('Load More Functionality', () => {
    it('should load more photos when requested', async () => {
      // Initial load
      mockSupabaseQuery.eq.mockResolvedValueOnce({
        data: mockPhotos,
        error: null,
      });

      const { result } = renderHook(() => 
        usePhotoData({
          search: '',
          fabrics: [],
          stockStatuses: [],
          priceRange: null,
        })
      );

      await waitFor(() => {
        expect(result.current.hasInitialLoad).toBe(true);
      });

      // Load more
      const additionalPhotos = [
        {
          id: '3',
          title: 'Test Photo 3',
          description: 'Third test photo',
          fabric: 'Wool',
          image_url: 'https://example.com/photo3.jpg',
          created_at: '2024-01-03T00:00:00Z',
          user_id: 'user-1',
          sort_order: 3,
        },
      ];

      mockSupabaseQuery.range.mockResolvedValueOnce({
        data: additionalPhotos,
        error: null,
      });

      await result.current.loadMore();

      expect(mockSupabaseQuery.range).toHaveBeenCalledWith(2, 25);
    });

    it('should handle load more errors', async () => {
      // Initial load
      mockSupabaseQuery.eq.mockResolvedValueOnce({
        data: mockPhotos,
        error: null,
      });

      const { result } = renderHook(() => 
        usePhotoData({
          search: '',
          fabrics: [],
          stockStatuses: [],
          priceRange: null,
        })
      );

      await waitFor(() => {
        expect(result.current.hasInitialLoad).toBe(true);
      });

      // Load more with error
      mockSupabaseQuery.range.mockResolvedValueOnce({
        data: null,
        error: new Error('Load more failed'),
      });

      await result.current.loadMore();

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error loading more photos",
        description: "Failed to load additional photos. Please try again.",
        variant: "destructive",
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should limit initial load to 24 photos', async () => {
      mockSupabaseQuery.eq.mockResolvedValueOnce({
        data: mockPhotos,
        error: null,
      });

      renderHook(() => 
        usePhotoData({
          search: '',
          fabrics: [],
          stockStatuses: [],
          priceRange: null,
        })
      );

      await waitFor(() => {
        expect(mockSupabaseQuery.limit).toHaveBeenCalledWith(24);
      });
    });

    it('should not limit subsequent fetches after initial load', async () => {
      // Initial load
      mockSupabaseQuery.eq.mockResolvedValueOnce({
        data: mockPhotos,
        error: null,
      });

      const { result, rerender } = renderHook(
        ({ filters }) => usePhotoData(filters),
        {
          initialProps: {
            filters: {
              search: '',
              fabrics: [],
              stockStatuses: [],
              priceRange: null,
            }
          }
        }
      );

      await waitFor(() => {
        expect(result.current.hasInitialLoad).toBe(true);
      });

      // Clear previous calls
      vi.clearAllMocks();
      (supabase.from as any).mockReturnValue(mockSupabaseQuery);

      // Subsequent fetch (e.g., filter change)
      mockSupabaseQuery.eq.mockResolvedValueOnce({
        data: mockPhotos,
        error: null,
      });

      rerender({
        filters: {
          search: 'test',
          fabrics: [],
          stockStatuses: [],
          priceRange: null,
        }
      });

      await waitFor(() => {
        expect(mockSupabaseQuery.limit).not.toHaveBeenCalled();
      });
    });
  });
});
