import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchAndFilters, { FilterState } from '@/components/SearchAndFilters';
import { useAuth } from '@/contexts/AuthContext';

// Mock dependencies
vi.mock('@/contexts/AuthContext');
vi.mock('@/components/FabricFilter', () => ({
  default: ({ selectedFabrics, onChange }: any) => (
    <div data-testid="fabric-filter">
      <button onClick={() => onChange(['Cotton', 'Silk'])}>
        Select Fabrics ({selectedFabrics.length})
      </button>
    </div>
  ),
}));
vi.mock('@/components/StockStatusFilter', () => ({
  default: ({ selectedStatuses, onChange }: any) => (
    <div data-testid="stock-filter">
      <button onClick={() => onChange(['In Stock', 'Low Stock'])}>
        Select Stock ({selectedStatuses.length})
      </button>
    </div>
  ),
}));
vi.mock('@/components/PriceRangeFilter', () => ({
  default: ({ selectedRange, onChange }: any) => (
    <div data-testid="price-filter">
      <button onClick={() => onChange('300-500')}>
        Select Price ({selectedRange || 'None'})
      </button>
    </div>
  ),
}));

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
};

const defaultFilters: FilterState = {
  search: '',
  fabrics: [],
  stockStatuses: [],
  priceRange: '',
};

describe('SearchAndFilters Component', () => {
  const mockOnChange = vi.fn();
  const mockOnClearAll = vi.fn();
  const mockOnSelectAll = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    // Mock window.innerWidth for mobile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Basic Rendering', () => {
    it('should render search bar and filters for authenticated user', () => {
      render(
        <SearchAndFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={10}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      expect(screen.getByPlaceholderText(/Search by title or description/)).toBeInTheDocument();
      expect(screen.getByTestId('fabric-filter')).toBeInTheDocument();
      expect(screen.getByTestId('stock-filter')).toBeInTheDocument();
      expect(screen.getByTestId('price-filter')).toBeInTheDocument();
    });

    it('should show disabled state for unauthenticated user', () => {
      (useAuth as any).mockReturnValue({ user: null });

      render(
        <SearchAndFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={0}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Sign in to search/);
      expect(searchInput).toBeDisabled();
      expect(screen.getByText(/Sign in to use filters/)).toBeInTheDocument();
    });

    it('should display photo count', () => {
      const photosCount = 25;
      render(
        <SearchAndFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={photosCount}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      expect(screen.getByText(photosCount.toString())).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should handle search input changes', async () => {
      render(
        <SearchAndFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={10}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search by title or description/);
      await userEvent.type(searchInput, 'cotton');

      // Note: The actual onChange call would be debounced in the SearchBar component
      // This test verifies the integration
      expect(searchInput).toHaveValue('cotton');
    });

    it('should prevent search for unauthenticated users', () => {
      (useAuth as any).mockReturnValue({ user: null });

      render(
        <SearchAndFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={0}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Sign in to search/);
      expect(searchInput).toBeDisabled();
    });
  });

  describe('Filter Combinations', () => {
    it('should handle single filter selection', async () => {
      render(
        <SearchAndFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={10}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      const fabricFilter = screen.getByTestId('fabric-filter');
      await userEvent.click(fabricFilter.querySelector('button')!);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultFilters,
        fabrics: ['Cotton', 'Silk'],
      });
    });

    it('should handle multiple filter combinations', async () => {
      const filtersWithFabrics = {
        ...defaultFilters,
        fabrics: ['Cotton'],
      };

      const { rerender } = render(
        <SearchAndFilters
          filters={filtersWithFabrics}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={10}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      // Add stock status filter
      const stockFilter = screen.getByTestId('stock-filter');
      await userEvent.click(stockFilter.querySelector('button')!);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...filtersWithFabrics,
        stockStatuses: ['In Stock', 'Low Stock'],
      });

      // Update component with new filters
      const filtersWithMultiple = {
        ...filtersWithFabrics,
        stockStatuses: ['In Stock'],
      };

      rerender(
        <SearchAndFilters
          filters={filtersWithMultiple}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={5}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      // Add price range filter
      const priceFilter = screen.getByTestId('price-filter');
      await userEvent.click(priceFilter.querySelector('button')!);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...filtersWithMultiple,
        priceRange: '300-500',
      });
    });

    it('should show active filters indicator', () => {
      const activeFilters = {
        search: 'cotton',
        fabrics: ['Cotton', 'Silk'],
        stockStatuses: ['In Stock'],
        priceRange: '300-500',
      };

      render(
        <SearchAndFilters
          filters={activeFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={3}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      expect(screen.getByText(/Search: "cotton"/)).toBeInTheDocument();
      expect(screen.getByText(/Fabrics: 2/)).toBeInTheDocument();
      expect(screen.getByText(/Stock: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Price: 300-500/)).toBeInTheDocument();
    });

    it('should handle complex filter scenarios', async () => {
      const complexFilters = {
        search: 'premium fabric',
        fabrics: ['Cotton', 'Silk', 'Wool'],
        stockStatuses: ['In Stock', 'Low Stock', 'Out of Stock'],
        priceRange: '700-1000',
      };

      render(
        <SearchAndFilters
          filters={complexFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={1}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      // Verify all filters are reflected
      expect(screen.getByDisplayValue('premium fabric')).toBeInTheDocument();
      expect(screen.getByText(/Fabrics: 3/)).toBeInTheDocument();
      expect(screen.getByText(/Stock: 3/)).toBeInTheDocument();
      expect(screen.getByText(/Price: 700-1000/)).toBeInTheDocument();
    });
  });

  describe('Clear All Functionality', () => {
    it('should enable clear all when filters are active', () => {
      const activeFilters = {
        ...defaultFilters,
        search: 'test',
        fabrics: ['Cotton'],
      };

      render(
        <SearchAndFilters
          filters={activeFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={5}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      const clearButton = screen.getByRole('button', { name: /Clear All/ });
      expect(clearButton).not.toBeDisabled();
    });

    it('should disable clear all when no filters are active', () => {
      render(
        <SearchAndFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={10}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      const clearButton = screen.getByRole('button', { name: /Clear All/ });
      expect(clearButton).toBeDisabled();
    });

    it('should call onClearAll when clicked', async () => {
      const activeFilters = {
        ...defaultFilters,
        search: 'test',
      };

      render(
        <SearchAndFilters
          filters={activeFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={5}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      const clearButton = screen.getByRole('button', { name: /Clear All/ });
      await userEvent.click(clearButton);

      expect(mockOnClearAll).toHaveBeenCalled();
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });
    });

    it('should show collapsible filters on mobile', () => {
      render(
        <SearchAndFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={10}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      const filtersButton = screen.getByRole('button', { name: /Filters/ });
      expect(filtersButton).toBeInTheDocument();
    });

    it('should expand/collapse filters on mobile', async () => {
      render(
        <SearchAndFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={10}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      const filtersButton = screen.getByRole('button', { name: /Filters/ });
      
      // Initially collapsed - filters should not be visible
      expect(screen.queryByTestId('fabric-filter')).not.toBeInTheDocument();
      
      // Expand filters
      await userEvent.click(filtersButton);
      
      // Filters should now be visible
      expect(screen.getByTestId('fabric-filter')).toBeInTheDocument();
    });

    it('should show mobile clear button when filters are active', () => {
      const activeFilters = {
        ...defaultFilters,
        search: 'test',
      };

      render(
        <SearchAndFilters
          filters={activeFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={5}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      // Should show mobile clear button (icon only)
      const clearButtons = screen.getAllByRole('button');
      const mobileClearButton = clearButtons.find(button => 
        button.querySelector('svg') && !button.textContent?.includes('Clear All')
      );
      expect(mobileClearButton).toBeInTheDocument();
    });
  });

  describe('Selection Mode', () => {
    it('should show select all checkbox in selection mode', () => {
      render(
        <SearchAndFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={10}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={true}
        />
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    it('should handle select all checkbox changes', async () => {
      render(
        <SearchAndFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={10}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={true}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);

      expect(mockOnSelectAll).toHaveBeenCalled();
    });

    it('should show checked state when all selected', () => {
      render(
        <SearchAndFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={10}
          onSelectAll={mockOnSelectAll}
          isAllSelected={true}
          isSelectionMode={true}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should not show select all when not in selection mode', () => {
      render(
        <SearchAndFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={10}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      expect(screen.queryByText('Select All')).not.toBeInTheDocument();
    });
  });

  describe('Filter State Management', () => {
    it('should prevent filter changes for unauthenticated users', async () => {
      (useAuth as any).mockReturnValue({ user: null });

      render(
        <SearchAndFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={0}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      // Filters should be disabled
      const fabricFilter = screen.getByTestId('fabric-filter');
      expect(fabricFilter.closest('div')).toHaveClass('opacity-50', 'pointer-events-none');
    });

    it('should handle edge case with empty filter arrays', () => {
      const emptyFilters = {
        search: '',
        fabrics: [],
        stockStatuses: [],
        priceRange: '',
      };

      render(
        <SearchAndFilters
          filters={emptyFilters}
          onChange={mockOnChange}
          onClearAll={mockOnClearAll}
          photosCount={0}
          onSelectAll={mockOnSelectAll}
          isAllSelected={false}
          isSelectionMode={false}
        />
      );

      // Should not show active filters indicator
      expect(screen.queryByText(/Search:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Fabrics:/)).not.toBeInTheDocument();
    });
  });
});
