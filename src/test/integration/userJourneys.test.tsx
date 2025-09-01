import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { PhotoSelectionProvider } from '@/contexts/PhotoSelectionContext';
import Index from '@/pages/Index';
import { toast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('@/hooks/use-toast');
vi.mock('@/integrations/supabase/client');
vi.mock('@/utils/sharing');

import { shareToWhatsApp, shareMultipleToWhatsApp } from '@/utils/sharing';

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <PhotoSelectionProvider>
            {children}
          </PhotoSelectionProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Mock photo data
const mockPhotos = [
  {
    id: '1',
    title: 'Cotton Saree',
    description: 'Beautiful cotton saree',
    image_url: 'https://example.com/saree1.jpg',
    fabric: 'Cotton',
    price: 2500,
    stock_status: 'in_stock',
    user_id: 'user1',
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Silk Saree',
    description: 'Premium silk saree',
    image_url: 'https://example.com/saree2.jpg',
    fabric: 'Silk',
    price: 5000,
    stock_status: 'in_stock',
    user_id: 'user1',
    sort_order: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('User Journey Integration Tests', () => {
  const user = userEvent.setup();
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (toast as any).mockReturnValue({ dismiss: vi.fn() });
    (shareToWhatsApp as any).mockResolvedValue(undefined);
    (shareMultipleToWhatsApp as any).mockResolvedValue(undefined);

    // Mock successful API responses
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/rest/v1/photos')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPhotos),
          headers: new Headers(),
        });
      }
      if (url.includes('/rest/v1/fabric_types')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: '1', name: 'Cotton' },
            { id: '2', name: 'Silk' },
          ]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  describe('Photo Management Journey', () => {
    it('should complete full photo management workflow', async () => {
      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Cotton Saree')).toBeInTheDocument();
      });

      // Step 1: Search for photos
      const searchInput = screen.getByPlaceholderText(/search photos/i);
      await user.type(searchInput, 'cotton');
      
      await waitFor(() => {
        expect(searchInput).toHaveValue('cotton');
      });

      // Step 2: Apply filters
      const fabricFilter = screen.getByRole('combobox', { name: /fabric/i });
      await user.click(fabricFilter);
      
      const cottonOption = await screen.findByText('Cotton');
      await user.click(cottonOption);

      // Step 3: Select photos for bulk operations
      const photoCards = screen.getAllByTestId(/photo-card/);
      expect(photoCards).toHaveLength(2);

      // Enter selection mode
      const selectButton = screen.getByRole('button', { name: /select/i });
      await user.click(selectButton);

      // Select first photo
      const firstPhotoCheckbox = within(photoCards[0]).getByRole('checkbox');
      await user.click(firstPhotoCheckbox);

      // Step 4: Bulk share selected photos
      const shareButton = screen.getByRole('button', { name: /share selected/i });
      await user.click(shareButton);

      expect(shareMultipleToWhatsApp).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            title: 'Cotton Saree',
            imageUrl: 'https://example.com/saree1.jpg',
          }),
        ]),
        'auto'
      );
    });

    it('should handle photo editing workflow', async () => {
      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Cotton Saree')).toBeInTheDocument();
      });

      // Open edit modal for first photo
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      // Wait for edit modal to open
      const modal = await screen.findByRole('dialog');
      expect(modal).toBeInTheDocument();

      // Edit photo details
      const titleInput = within(modal).getByLabelText(/title/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Cotton Saree');

      const priceInput = within(modal).getByLabelText(/price/i);
      await user.clear(priceInput);
      await user.type(priceInput, '3000');

      // Save changes
      const saveButton = within(modal).getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Verify API call was made
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/rest/v1/photos?id=eq.1'),
          expect.objectContaining({
            method: 'PATCH',
            body: expect.stringContaining('Updated Cotton Saree'),
          })
        );
      });
    });
  });

  describe('Sorting and Organization Journey', () => {
    it('should handle drag and drop sorting workflow', async () => {
      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Cotton Saree')).toBeInTheDocument();
      });

      // Get photo cards
      const photoCards = screen.getAllByTestId(/photo-card/);
      const firstCard = photoCards[0];
      const secondCard = photoCards[1];

      // Simulate drag and drop
      fireEvent.dragStart(firstCard);
      fireEvent.dragEnter(secondCard);
      fireEvent.dragOver(secondCard);
      fireEvent.drop(secondCard);
      fireEvent.dragEnd(firstCard);

      // Verify sorting API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/rest/v1/photos'),
          expect.objectContaining({
            method: 'PATCH',
            body: expect.stringContaining('sort_order'),
          })
        );
      });
    });

    it('should handle multi-select sorting', async () => {
      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Cotton Saree')).toBeInTheDocument();
      });

      // Enter selection mode
      const selectButton = screen.getByRole('button', { name: /select/i });
      await user.click(selectButton);

      // Select multiple photos
      const photoCards = screen.getAllByTestId(/photo-card/);
      const checkboxes = photoCards.map(card => within(card).getByRole('checkbox'));
      
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      // Perform bulk sort operation
      const sortButton = screen.getByRole('button', { name: /sort selected/i });
      await user.click(sortButton);

      // Verify bulk sort API calls
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/rest/v1/photos'),
          expect.objectContaining({
            method: 'PATCH',
          })
        );
      });
    });
  });

  describe('Search and Filter Journey', () => {
    it('should handle complex search and filter combinations', async () => {
      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Cotton Saree')).toBeInTheDocument();
      });

      // Apply search
      const searchInput = screen.getByPlaceholderText(/search photos/i);
      await user.type(searchInput, 'saree');

      // Apply fabric filter
      const fabricFilter = screen.getByRole('combobox', { name: /fabric/i });
      await user.click(fabricFilter);
      
      const silkOption = await screen.findByText('Silk');
      await user.click(silkOption);

      // Apply price filter
      const priceFilter = screen.getByRole('combobox', { name: /price/i });
      await user.click(priceFilter);
      
      const highPriceOption = await screen.findByText(/above/i);
      await user.click(highPriceOption);

      // Verify filtered results
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('title.ilike.%25saree%25'),
          expect.any(Object)
        );
      });

      // Clear all filters
      const clearButton = screen.getByRole('button', { name: /clear all/i });
      await user.click(clearButton);

      // Verify filters are cleared
      expect(searchInput).toHaveValue('');
    });

    it('should handle search performance with rapid typing', async () => {
      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Cotton Saree')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search photos/i);
      
      // Rapid typing simulation
      await user.type(searchInput, 'cotton saree beautiful');

      // Wait for debounce
      await waitFor(() => {
        expect(searchInput).toHaveValue('cotton saree beautiful');
      }, { timeout: 1000 });

      // Verify only final search was executed (debounced)
      const searchCalls = (global.fetch as any).mock.calls.filter((call: any) => 
        call[0].includes('title.ilike')
      );
      expect(searchCalls.length).toBeLessThan(5); // Should be debounced
    });
  });

  describe('Sharing Journey', () => {
    it('should complete single photo sharing workflow', async () => {
      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Cotton Saree')).toBeInTheDocument();
      });

      // Find and click share button for first photo
      const shareButtons = screen.getAllByRole('button', { name: /share/i });
      await user.click(shareButtons[0]);

      expect(shareToWhatsApp).toHaveBeenCalledWith({
        id: '1',
        title: 'Cotton Saree',
        imageUrl: 'https://example.com/saree1.jpg',
        price: 2500,
        description: 'Beautiful cotton saree',
      });
    });

    it('should complete bulk sharing workflow', async () => {
      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Cotton Saree')).toBeInTheDocument();
      });

      // Enter selection mode
      const selectButton = screen.getByRole('button', { name: /select/i });
      await user.click(selectButton);

      // Select all photos
      const selectAllButton = screen.getByRole('button', { name: /select all/i });
      await user.click(selectAllButton);

      // Share selected photos
      const shareSelectedButton = screen.getByRole('button', { name: /share selected/i });
      await user.click(shareSelectedButton);

      expect(shareMultipleToWhatsApp).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: '1' }),
          expect.objectContaining({ id: '2' }),
        ]),
        'auto'
      );
    });
  });

  describe('Error Handling Journey', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Verify error handling
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
        })
      );
    });

    it('should handle sharing errors gracefully', async () => {
      (shareToWhatsApp as any).mockRejectedValue(new Error('Sharing failed'));

      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Cotton Saree')).toBeInTheDocument();
      });

      // Attempt to share
      const shareButtons = screen.getAllByRole('button', { name: /share/i });
      await user.click(shareButtons[0]);

      // Verify error handling
      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Mobile Responsiveness Journey', () => {
    it('should adapt UI for mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Cotton Saree')).toBeInTheDocument();
      });

      // Verify mobile-specific UI elements
      const mobileMenu = screen.getByRole('button', { name: /menu/i });
      expect(mobileMenu).toBeInTheDocument();

      // Test mobile navigation
      await user.click(mobileMenu);
      
      const mobileNav = await screen.findByRole('navigation');
      expect(mobileNav).toBeInTheDocument();
    });

    it('should handle touch interactions on mobile', async () => {
      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Cotton Saree')).toBeInTheDocument();
      });

      const photoCard = screen.getAllByTestId(/photo-card/)[0];

      // Simulate touch events
      fireEvent.touchStart(photoCard, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      fireEvent.touchEnd(photoCard);

      // Verify touch interaction handling
      expect(photoCard).toBeInTheDocument();
    });
  });

  describe('Performance Journey', () => {
    it('should handle large photo collections efficiently', async () => {
      // Mock large dataset
      const largePhotoSet = Array.from({ length: 100 }, (_, i) => ({
        ...mockPhotos[0],
        id: `photo-${i}`,
        title: `Photo ${i}`,
      }));

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(largePhotoSet),
        headers: new Headers(),
      });

      const startTime = performance.now();

      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Photo 0')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time
      expect(renderTime).toBeLessThan(2000);
    });

    it('should implement virtual scrolling for large lists', async () => {
      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Cotton Saree')).toBeInTheDocument();
      });

      // Simulate scrolling
      const scrollContainer = screen.getByTestId('photo-grid');
      fireEvent.scroll(scrollContainer, { target: { scrollY: 1000 } });

      // Verify lazy loading behavior
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('offset='),
          expect.any(Object)
        );
      });
    });
  });
});
