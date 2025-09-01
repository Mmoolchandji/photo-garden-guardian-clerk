# Testing Guide

This document provides comprehensive information about the automated testing suite for Photo Garden Guardian Clerk.

## Overview

The testing suite covers all core functionalities with 100% isolation from production data. Tests are designed for speed, reliability, and comprehensive coverage.

## Test Architecture

### Framework Stack
- **Vitest**: Fast test runner with native TypeScript support
- **React Testing Library**: Component testing with user-centric approach
- **MSW (Mock Service Worker)**: API mocking for realistic testing
- **jsdom**: Browser environment simulation

### Mock Strategy
- **Supabase Client**: Fully mocked for database and storage operations
- **API Endpoints**: MSW handlers simulate real Supabase REST API
- **Browser APIs**: Global mocks for matchMedia, IntersectionObserver, etc.
- **External Services**: WhatsApp sharing utilities mocked

## Test Categories

### 1. Unit Tests - Hooks

#### `usePhotoData.test.ts`
Tests photo data fetching and management:
- ✅ Fetch photos with various filters
- ✅ Pagination and load more functionality
- ✅ Error handling and retry logic
- ✅ Loading state management
- ✅ Cache invalidation

#### `usePhotoUpload.test.ts`
Tests photo upload functionality:
- ✅ Single and bulk file selection
- ✅ File type validation
- ✅ Upload progress tracking
- ✅ Cancellation handling
- ✅ User authentication checks

#### `usePhotoSorting.test.ts`
Tests drag-and-drop sorting:
- ✅ Single photo reordering
- ✅ Multi-select sorting
- ✅ Database persistence
- ✅ Optimistic updates
- ✅ Error rollback

### 2. Unit Tests - Components

#### `SearchBar.test.tsx`
Tests search functionality:
- ✅ Input handling and debouncing
- ✅ Performance under rapid typing
- ✅ Special character handling
- ✅ Accessibility compliance
- ✅ Value synchronization

#### `SearchAndFilters.test.tsx`
Tests filtering system:
- ✅ Multiple filter combinations
- ✅ Clear all functionality
- ✅ Mobile responsiveness
- ✅ User role-based visibility
- ✅ Filter state persistence

### 3. Integration Tests - WhatsApp Sharing

#### `whatsappSharing.test.ts`
Tests complete sharing workflows:
- ✅ Single photo sharing (Web Share API → URL fallback)
- ✅ Multiple photo sharing (auto method selection)
- ✅ Batch size optimization (files/batched/gallery)
- ✅ Device-specific behavior
- ✅ Error recovery and user feedback
- ✅ Performance with large collections

### 4. Integration Tests - User Journeys

#### `userJourneys.test.tsx`
Tests complete user workflows:
- ✅ Photo management journey (search → filter → select → share)
- ✅ Editing workflow (open modal → edit → save)
- ✅ Sorting and organization
- ✅ Complex search and filter combinations
- ✅ Error handling scenarios
- ✅ Mobile responsiveness
- ✅ Performance with large datasets

## Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Open Vitest UI for interactive testing
npm run test:ui

# Run specific test file
npm test -- usePhotoData.test.ts

# Run tests matching pattern
npm test -- --grep "sharing"
```

### Coverage Targets

- **Overall Coverage**: >90%
- **Functions**: >95%
- **Lines**: >90%
- **Branches**: >85%

### Performance Benchmarks

Tests include performance validation:
- Component render time: <100ms
- Search debounce: 300ms delay
- Large dataset handling: <2s for 100+ items
- Memory usage: No significant leaks

## Test Data

### Mock Photos
```typescript
const mockPhoto = {
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
};
```

### Mock API Responses
- Photos endpoint: Returns filtered/paginated results
- Fabric types: Returns available fabric categories
- Storage: Simulates file upload/download
- Auth: Provides user session data

## Debugging Tests

### Common Issues

1. **Test Timeouts**
   ```bash
   # Increase timeout for slow operations
   npm test -- --timeout=10000
   ```

2. **Mock Issues**
   ```bash
   # Clear all mocks between tests
   vi.clearAllMocks()
   ```

3. **Async Operations**
   ```bash
   # Use waitFor for async assertions
   await waitFor(() => {
     expect(element).toBeInTheDocument();
   });
   ```

### Debug Mode

```bash
# Run tests with debug output
npm test -- --reporter=verbose

# Run single test with full output
npm test -- --grep "specific test" --reporter=verbose
```

## CI/CD Integration

### GitHub Actions
Tests run automatically on:
- Pull requests
- Push to main branch
- Scheduled daily runs

### Quality Gates
- All tests must pass
- Coverage must meet thresholds
- No console errors/warnings
- Performance benchmarks met

## Writing New Tests

### Test File Structure
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Component/Hook Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup mocks
  });

  describe('Feature Group', () => {
    it('should handle specific scenario', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on user interactions and outcomes
   - Avoid testing internal state directly

2. **Use Realistic Data**
   - Mirror production data structures
   - Include edge cases and error scenarios

3. **Isolate Tests**
   - Each test should be independent
   - Clean up after each test

4. **Performance Conscious**
   - Mock heavy operations
   - Use efficient queries and assertions

5. **Accessibility Testing**
   - Test keyboard navigation
   - Verify ARIA attributes
   - Check screen reader compatibility

## Troubleshooting

### Common Test Failures

1. **Element Not Found**
   ```typescript
   // Use waitFor for async elements
   await waitFor(() => {
     expect(screen.getByText('Loading...')).toBeInTheDocument();
   });
   ```

2. **Mock Not Working**
   ```typescript
   // Ensure mocks are properly configured
   vi.mock('@/utils/sharing', () => ({
     shareToWhatsApp: vi.fn(),
   }));
   ```

3. **Timing Issues**
   ```typescript
   // Use fake timers for time-dependent tests
   vi.useFakeTimers();
   vi.advanceTimersByTime(1000);
   ```

### Getting Help

1. Check test output for specific error messages
2. Review mock configurations in `src/test/mocks/`
3. Verify test setup in `src/test/setup.ts`
4. Run tests in UI mode for interactive debugging

## Maintenance

### Regular Tasks
- Update mock data to match API changes
- Review and update performance benchmarks
- Add tests for new features
- Refactor tests when components change

### Monitoring
- Track test execution time
- Monitor coverage trends
- Review flaky test reports
- Update dependencies regularly
