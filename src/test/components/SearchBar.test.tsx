import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '@/components/SearchBar';

describe('SearchBar Component', () => {
  const mockOnChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should render with default placeholder', () => {
      render(<SearchBar value="" onChange={mockOnChange} />);
      
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      const customPlaceholder = 'Search photos...';
      render(<SearchBar value="" onChange={mockOnChange} placeholder={customPlaceholder} />);
      
      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
    });

    it('should display initial value', () => {
      const initialValue = 'test search';
      render(<SearchBar value={initialValue} onChange={mockOnChange} />);
      
      expect(screen.getByDisplayValue(initialValue)).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<SearchBar value="" onChange={mockOnChange} disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('bg-gray-100', 'text-gray-500', 'cursor-not-allowed');
    });
  });

  describe('Debouncing Functionality', () => {
    it('should debounce onChange calls with default delay', async () => {
      render(<SearchBar value="" onChange={mockOnChange} />);
      
      const input = screen.getByRole('textbox');
      
      // Type multiple characters quickly
      await userEvent.type(input, 'test');
      
      // Should not call onChange immediately
      expect(mockOnChange).not.toHaveBeenCalled();
      
      // Fast-forward time by default debounce (500ms)
      vi.advanceTimersByTime(500);
      
      // Should call onChange once with final value
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith('test');
    });

    it('should debounce with custom delay', async () => {
      const customDebounce = 300;
      render(<SearchBar value="" onChange={mockOnChange} debounce={customDebounce} />);
      
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'test');
      
      // Should not call onChange before custom debounce time
      vi.advanceTimersByTime(299);
      expect(mockOnChange).not.toHaveBeenCalled();
      
      // Should call onChange after custom debounce time
      vi.advanceTimersByTime(1);
      expect(mockOnChange).toHaveBeenCalledWith('test');
    });

    it('should reset debounce timer on new input', async () => {
      render(<SearchBar value="" onChange={mockOnChange} />);
      
      const input = screen.getByRole('textbox');
      
      // Type first character
      await userEvent.type(input, 't');
      
      // Advance time partially
      vi.advanceTimersByTime(300);
      
      // Type another character (should reset timer)
      await userEvent.type(input, 'e');
      
      // Advance time by remaining original debounce
      vi.advanceTimersByTime(200);
      expect(mockOnChange).not.toHaveBeenCalled();
      
      // Advance by full debounce from last input
      vi.advanceTimersByTime(300);
      expect(mockOnChange).toHaveBeenCalledWith('te');
    });

    it('should not call onChange if value has not changed', async () => {
      const initialValue = 'test';
      render(<SearchBar value={initialValue} onChange={mockOnChange} />);
      
      const input = screen.getByRole('textbox');
      
      // Clear and retype same value
      await userEvent.clear(input);
      await userEvent.type(input, initialValue);
      
      vi.advanceTimersByTime(500);
      
      // Should not call onChange since final value matches initial
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid typing without performance issues', async () => {
      render(<SearchBar value="" onChange={mockOnChange} />);
      
      const input = screen.getByRole('textbox');
      const longText = 'a'.repeat(100);
      
      const startTime = performance.now();
      
      // Simulate rapid typing
      for (let i = 0; i < longText.length; i++) {
        fireEvent.change(input, { target: { value: longText.substring(0, i + 1) } });
      }
      
      const endTime = performance.now();
      
      // Should complete quickly (less than 100ms for 100 characters)
      expect(endTime - startTime).toBeLessThan(100);
      
      // Should still only call onChange once after debounce
      vi.advanceTimersByTime(500);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith(longText);
    });

    it('should handle special characters and unicode', async () => {
      render(<SearchBar value="" onChange={mockOnChange} />);
      
      const input = screen.getByRole('textbox');
      const specialText = '🔍 Special chars: @#$%^&*()_+-=[]{}|;:,.<>?';
      
      await userEvent.type(input, specialText);
      
      vi.advanceTimersByTime(500);
      
      expect(mockOnChange).toHaveBeenCalledWith(specialText);
    });

    it('should handle very long search queries', async () => {
      render(<SearchBar value="" onChange={mockOnChange} />);
      
      const input = screen.getByRole('textbox');
      const veryLongText = 'This is a very long search query that might be used to test the performance and behavior of the search component when dealing with extensive text input that could potentially cause issues'.repeat(10);
      
      await userEvent.type(input, veryLongText);
      
      vi.advanceTimersByTime(500);
      
      expect(mockOnChange).toHaveBeenCalledWith(veryLongText);
    });
  });

  describe('Search Query Types', () => {
    it('should handle single character searches', async () => {
      render(<SearchBar value="" onChange={mockOnChange} />);
      
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'a');
      
      vi.advanceTimersByTime(500);
      
      expect(mockOnChange).toHaveBeenCalledWith('a');
    });

    it('should handle full word searches', async () => {
      render(<SearchBar value="" onChange={mockOnChange} />);
      
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'cotton fabric');
      
      vi.advanceTimersByTime(500);
      
      expect(mockOnChange).toHaveBeenCalledWith('cotton fabric');
    });

    it('should handle case-sensitive searches', async () => {
      render(<SearchBar value="" onChange={mockOnChange} />);
      
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'CotTon FaBriC');
      
      vi.advanceTimersByTime(500);
      
      expect(mockOnChange).toHaveBeenCalledWith('CotTon FaBriC');
    });

    it('should handle searches with leading/trailing spaces', async () => {
      render(<SearchBar value="" onChange={mockOnChange} />);
      
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, '  cotton fabric  ');
      
      vi.advanceTimersByTime(500);
      
      expect(mockOnChange).toHaveBeenCalledWith('  cotton fabric  ');
    });

    it('should handle empty search (clearing)', async () => {
      render(<SearchBar value="initial" onChange={mockOnChange} />);
      
      const input = screen.getByRole('textbox');
      
      await userEvent.clear(input);
      
      vi.advanceTimersByTime(500);
      
      expect(mockOnChange).toHaveBeenCalledWith('');
    });
  });

  describe('Value Synchronization', () => {
    it('should update input when value prop changes', () => {
      const { rerender } = render(<SearchBar value="initial" onChange={mockOnChange} />);
      
      expect(screen.getByDisplayValue('initial')).toBeInTheDocument();
      
      rerender(<SearchBar value="updated" onChange={mockOnChange} />);
      
      expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
    });

    it('should maintain input focus during value updates', async () => {
      const { rerender } = render(<SearchBar value="" onChange={mockOnChange} />);
      
      const input = screen.getByRole('textbox');
      input.focus();
      
      expect(input).toHaveFocus();
      
      rerender(<SearchBar value="updated" onChange={mockOnChange} />);
      
      // Focus should be maintained
      expect(input).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SearchBar value="" onChange={mockOnChange} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should support keyboard navigation', async () => {
      render(<SearchBar value="" onChange={mockOnChange} />);
      
      const input = screen.getByRole('textbox');
      
      // Should be focusable
      input.focus();
      expect(input).toHaveFocus();
      
      // Should handle keyboard input
      await userEvent.keyboard('test search');
      
      vi.advanceTimersByTime(500);
      
      expect(mockOnChange).toHaveBeenCalledWith('test search');
    });

    it('should indicate disabled state properly', () => {
      render(<SearchBar value="" onChange={mockOnChange} disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('disabled');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid enable/disable changes', () => {
      const { rerender } = render(<SearchBar value="" onChange={mockOnChange} disabled={false} />);
      
      const input = screen.getByRole('textbox');
      expect(input).not.toBeDisabled();
      
      rerender(<SearchBar value="" onChange={mockOnChange} disabled={true} />);
      expect(input).toBeDisabled();
      
      rerender(<SearchBar value="" onChange={mockOnChange} disabled={false} />);
      expect(input).not.toBeDisabled();
    });

    it('should cleanup timers on unmount', () => {
      const { unmount } = render(<SearchBar value="" onChange={mockOnChange} />);
      
      const input = screen.getByRole('textbox');
      
      // Start typing
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Unmount before debounce completes
      unmount();
      
      // Advance timers - should not call onChange after unmount
      vi.advanceTimersByTime(500);
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
});
