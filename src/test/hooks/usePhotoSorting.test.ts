import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePhotoSorting } from '@/hooks/usePhotoSorting';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Photo } from '@/types/photo';

// Mock dependencies
vi.mock('@/integrations/supabase/client');
vi.mock('@/components/ui/use-toast');
vi.mock('@dnd-kit/core', () => ({
  DndContext: 'div',
  DragOverlay: 'div',
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  TouchSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));
vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: vi.fn((array, from, to) => {
    const result = [...array];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  }),
  SortableContext: 'div',
  sortableKeyboardCoordinates: vi.fn(),
  rectSortingStrategy: vi.fn(),
}));

const mockPhotos: Photo[] = [
  {
    id: '1',
    title: 'Photo 1',
    description: 'First photo',
    image_url: 'https://example.com/1.jpg',
    created_at: '2024-01-01T00:00:00Z',
    user_id: 'user-1',
    sort_order: 1,
  },
  {
    id: '2',
    title: 'Photo 2',
    description: 'Second photo',
    image_url: 'https://example.com/2.jpg',
    created_at: '2024-01-02T00:00:00Z',
    user_id: 'user-1',
    sort_order: 2,
  },
  {
    id: '3',
    title: 'Photo 3',
    description: 'Third photo',
    image_url: 'https://example.com/3.jpg',
    created_at: '2024-01-03T00:00:00Z',
    user_id: 'user-1',
    sort_order: 3,
  },
];

describe('usePhotoSorting', () => {
  const mockOnPhotosReordered = vi.fn();
  const mockToast = vi.fn();
  const mockIsPhotoSelected = vi.fn();
  const selectedPhotoIds = new Set<string>();

  const mockSupabaseUpdate = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ error: null }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useToast as any).mockReturnValue({
      toast: mockToast,
    });
    
    (supabase.from as any).mockReturnValue(mockSupabaseUpdate);
    mockIsPhotoSelected.mockReturnValue(false);
  });

  describe('Single Photo Sorting', () => {
    it('should handle single photo drag and drop', async () => {
      const { result } = renderHook(() =>
        usePhotoSorting(
          mockPhotos,
          mockOnPhotosReordered,
          selectedPhotoIds,
          mockIsPhotoSelected
        )
      );

      // Simulate drag start
      const dragStartEvent = {
        active: { id: '1' },
      };

      act(() => {
        result.current.handleDragStart(dragStartEvent as any);
      });

      expect(result.current.activePhoto).toEqual(mockPhotos[0]);

      // Simulate drag end (move photo 1 to position 2)
      const dragEndEvent = {
        active: { id: '1' },
        over: { id: '3' },
      };

      await act(async () => {
        await result.current.handleDragEnd(dragEndEvent as any);
      });

      expect(mockSupabaseUpdate.update).toHaveBeenCalledTimes(3);
      expect(mockOnPhotosReordered).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: "Photos reordered",
        description: "1 photo reordered successfully.",
      });
    });

    it('should not reorder when dropped on same position', async () => {
      const { result } = renderHook(() =>
        usePhotoSorting(
          mockPhotos,
          mockOnPhotosReordered,
          selectedPhotoIds,
          mockIsPhotoSelected
        )
      );

      const dragEndEvent = {
        active: { id: '1' },
        over: { id: '1' },
      };

      await act(async () => {
        await result.current.handleDragEnd(dragEndEvent as any);
      });

      expect(mockSupabaseUpdate.update).not.toHaveBeenCalled();
      expect(mockOnPhotosReordered).not.toHaveBeenCalled();
    });

    it('should handle drag without over target', async () => {
      const { result } = renderHook(() =>
        usePhotoSorting(
          mockPhotos,
          mockOnPhotosReordered,
          selectedPhotoIds,
          mockIsPhotoSelected
        )
      );

      const dragEndEvent = {
        active: { id: '1' },
        over: null,
      };

      await act(async () => {
        await result.current.handleDragEnd(dragEndEvent as any);
      });

      expect(mockSupabaseUpdate.update).not.toHaveBeenCalled();
      expect(mockOnPhotosReordered).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Photo Sorting', () => {
    it('should handle multiple selected photos drag and drop', async () => {
      const selectedIds = new Set(['1', '2']);
      mockIsPhotoSelected.mockImplementation((id: string) => selectedIds.has(id));

      const { result } = renderHook(() =>
        usePhotoSorting(
          mockPhotos,
          mockOnPhotosReordered,
          selectedIds,
          mockIsPhotoSelected
        )
      );

      // Simulate dragging a selected photo
      const dragEndEvent = {
        active: { id: '1' },
        over: { id: '3' },
      };

      await act(async () => {
        await result.current.handleDragEnd(dragEndEvent as any);
      });

      expect(mockSupabaseUpdate.update).toHaveBeenCalledTimes(3);
      expect(mockToast).toHaveBeenCalledWith({
        title: "Photos reordered",
        description: "2 photos reordered successfully.",
      });
    });

    it('should handle single photo when not selected in group', async () => {
      const selectedIds = new Set(['2', '3']);
      mockIsPhotoSelected.mockImplementation((id: string) => selectedIds.has(id));

      const { result } = renderHook(() =>
        usePhotoSorting(
          mockPhotos,
          mockOnPhotosReordered,
          selectedIds,
          mockIsPhotoSelected
        )
      );

      // Drag unselected photo
      const dragEndEvent = {
        active: { id: '1' },
        over: { id: '3' },
      };

      await act(async () => {
        await result.current.handleDragEnd(dragEndEvent as any);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Photos reordered",
        description: "1 photo reordered successfully.",
      });
    });
  });

  describe('View Mode Optimization', () => {
    it('should use different sensor settings for compact view', () => {
      const { result: gridResult } = renderHook(() =>
        usePhotoSorting(
          mockPhotos,
          mockOnPhotosReordered,
          selectedPhotoIds,
          mockIsPhotoSelected,
          'grid'
        )
      );

      const { result: compactResult } = renderHook(() =>
        usePhotoSorting(
          mockPhotos,
          mockOnPhotosReordered,
          selectedPhotoIds,
          mockIsPhotoSelected,
          'compact'
        )
      );

      // Both should have sensors configured
      expect(gridResult.current.sensors).toBeDefined();
      expect(compactResult.current.sensors).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle database update errors', async () => {
      mockSupabaseUpdate.eq.mockResolvedValueOnce({
        error: new Error('Database error'),
      });

      const { result } = renderHook(() =>
        usePhotoSorting(
          mockPhotos,
          mockOnPhotosReordered,
          selectedPhotoIds,
          mockIsPhotoSelected
        )
      );

      const dragEndEvent = {
        active: { id: '1' },
        over: { id: '2' },
      };

      await act(async () => {
        await result.current.handleDragEnd(dragEndEvent as any);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to save photo order. Please try again.",
        variant: "destructive",
      });
    });

    it('should handle invalid photo IDs', async () => {
      const { result } = renderHook(() =>
        usePhotoSorting(
          mockPhotos,
          mockOnPhotosReordered,
          selectedPhotoIds,
          mockIsPhotoSelected
        )
      );

      const dragEndEvent = {
        active: { id: 'invalid-id' },
        over: { id: '2' },
      };

      await act(async () => {
        await result.current.handleDragEnd(dragEndEvent as any);
      });

      expect(mockSupabaseUpdate.update).not.toHaveBeenCalled();
    });
  });

  describe('Drag State Management', () => {
    it('should set active photo on drag start', () => {
      const { result } = renderHook(() =>
        usePhotoSorting(
          mockPhotos,
          mockOnPhotosReordered,
          selectedPhotoIds,
          mockIsPhotoSelected
        )
      );

      const dragStartEvent = {
        active: { id: '2' },
      };

      act(() => {
        result.current.handleDragStart(dragStartEvent as any);
      });

      expect(result.current.activePhoto).toEqual(mockPhotos[1]);
    });

    it('should clear active photo on drag cancel', () => {
      const { result } = renderHook(() =>
        usePhotoSorting(
          mockPhotos,
          mockOnPhotosReordered,
          selectedPhotoIds,
          mockIsPhotoSelected
        )
      );

      // Set active photo first
      const dragStartEvent = {
        active: { id: '2' },
      };

      act(() => {
        result.current.handleDragStart(dragStartEvent as any);
      });

      expect(result.current.activePhoto).toEqual(mockPhotos[1]);

      // Cancel drag
      act(() => {
        result.current.handleDragCancel();
      });

      expect(result.current.activePhoto).toBe(null);
    });

    it('should clear active photo on drag end', async () => {
      const { result } = renderHook(() =>
        usePhotoSorting(
          mockPhotos,
          mockOnPhotosReordered,
          selectedPhotoIds,
          mockIsPhotoSelected
        )
      );

      // Set active photo first
      const dragStartEvent = {
        active: { id: '1' },
      };

      act(() => {
        result.current.handleDragStart(dragStartEvent as any);
      });

      expect(result.current.activePhoto).toEqual(mockPhotos[0]);

      // End drag
      const dragEndEvent = {
        active: { id: '1' },
        over: { id: '2' },
      };

      await act(async () => {
        await result.current.handleDragEnd(dragEndEvent as any);
      });

      expect(result.current.activePhoto).toBe(null);
    });
  });

  describe('Update State Management', () => {
    it('should track updating state during database operations', async () => {
      let resolveUpdate: () => void;
      const updatePromise = new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      });

      mockSupabaseUpdate.eq.mockReturnValue(updatePromise.then(() => ({ error: null })));

      const { result } = renderHook(() =>
        usePhotoSorting(
          mockPhotos,
          mockOnPhotosReordered,
          selectedPhotoIds,
          mockIsPhotoSelected
        )
      );

      const dragEndEvent = {
        active: { id: '1' },
        over: { id: '2' },
      };

      // Start drag end operation
      const dragEndPromise = act(async () => {
        await result.current.handleDragEnd(dragEndEvent as any);
      });

      // Should be updating
      expect(result.current.isUpdating).toBe(true);

      // Resolve the update
      resolveUpdate!();
      await dragEndPromise;

      // Should no longer be updating
      expect(result.current.isUpdating).toBe(false);
    });
  });

  describe('Sort Order Calculation', () => {
    it('should assign correct sort orders after reordering', async () => {
      const { result } = renderHook(() =>
        usePhotoSorting(
          mockPhotos,
          mockOnPhotosReordered,
          selectedPhotoIds,
          mockIsPhotoSelected
        )
      );

      const dragEndEvent = {
        active: { id: '1' },
        over: { id: '3' },
      };

      await act(async () => {
        await result.current.handleDragEnd(dragEndEvent as any);
      });

      // Verify that sort orders are updated sequentially
      expect(mockSupabaseUpdate.update).toHaveBeenCalledWith({ sort_order: 1 });
      expect(mockSupabaseUpdate.update).toHaveBeenCalledWith({ sort_order: 2 });
      expect(mockSupabaseUpdate.update).toHaveBeenCalledWith({ sort_order: 3 });
    });
  });
});
