# Photo Garden Guardian Clerk

A React + TypeScript web application for textile businesses to manage fabric photos with comprehensive testing coverage.

## Features

- **Photo Management**: Upload, edit, delete, and organize fabric photos
- **Advanced Search & Filtering**: Find photos by title, fabric type, price range, and stock status
- **Drag & Drop Sorting**: Intuitive photo organization with multi-select support
- **WhatsApp Sharing**: Share single photos or bulk collections via WhatsApp
- **Role-Based Access**: Admin and user roles with appropriate permissions
- **Mobile Optimized**: Responsive design for mobile and desktop use
- **Real-time Updates**: Live photo updates with optimistic UI

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Testing**: Vitest, React Testing Library, MSW
- **Build Tool**: Vite
- **Drag & Drop**: dnd-kit
- **State Management**: TanStack Query, React Context

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd photo-garden-guardian-clerk
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Add your Supabase keys
```

4. Start development server
```bash
npm run dev
```

## Testing

This project includes comprehensive automated testing covering all core functionalities.

### Test Structure

```
src/test/
├── setup.ts                    # Test configuration and global mocks
├── mocks/
│   ├── server.ts              # MSW server setup
│   ├── handlers.ts            # API mock handlers
│   └── supabase.ts            # Supabase client mocks
├── hooks/                     # Hook unit tests
│   ├── usePhotoData.test.ts
│   ├── usePhotoUpload.test.ts
│   └── usePhotoSorting.test.ts
├── components/                # Component unit tests
│   ├── SearchBar.test.tsx
│   └── SearchAndFilters.test.tsx
├── utils/
│   └── sharing/
│       └── whatsappSharing.test.ts
└── integration/
    └── userJourneys.test.tsx  # End-to-end user workflows
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

### Test Coverage Areas

#### **CRUD Operations**
- ✅ Photo fetching with filters and pagination
- ✅ Photo upload (single and bulk)
- ✅ Photo editing and updates
- ✅ Photo deletion
- ✅ Error handling and loading states

#### **Search & Filtering**
- ✅ Debounced search functionality
- ✅ Multiple filter combinations
- ✅ Performance optimization
- ✅ Clear all filters
- ✅ Mobile responsiveness

#### **Sorting & Organization**
- ✅ Drag and drop single photos
- ✅ Multi-select drag and drop
- ✅ Sort order persistence
- ✅ Error handling and rollback

#### **WhatsApp Sharing**
- ✅ Single photo sharing
- ✅ Multiple photo sharing (auto method selection)
- ✅ Batch sharing consistency
- ✅ Device-specific behavior (mobile/desktop)
- ✅ Progressive fallback strategies
- ✅ Error recovery and user feedback

#### **Integration Tests**
- ✅ Complete user workflows
- ✅ Photo management journey
- ✅ Search and filter combinations
- ✅ Sorting and organization
- ✅ Sharing workflows
- ✅ Error handling scenarios
- ✅ Mobile responsiveness
- ✅ Performance with large datasets

### Test Configuration

Tests use the following setup:
- **Vitest** for test runner with jsdom environment
- **React Testing Library** for component testing
- **MSW (Mock Service Worker)** for API mocking
- **Global mocks** for browser APIs (matchMedia, IntersectionObserver, etc.)

### Mock Data

Tests use realistic mock data that mirrors production:
- Sample fabric photos with proper metadata
- Fabric type categories (Cotton, Silk, etc.)
- User authentication states
- API response structures

### Performance Testing

Tests include performance benchmarks:
- Large photo collection handling (100+ items)
- Search debouncing efficiency
- Render time optimization
- Memory usage validation

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:ui      # Open Vitest UI
git push origin main --force
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, PhotoSelection)
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── pages/              # Route components
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── test/               # Test files and mocks
```

## Testing Best Practices

1. **Isolation**: Tests don't affect production data
2. **Repeatability**: Tests produce consistent results
3. **Performance**: Fast execution with proper mocking
4. **Coverage**: All critical paths tested
5. **Realistic**: Mock data mirrors real scenarios
6. **Error Handling**: Both success and failure cases covered

## Contributing

1. Write tests for new features
2. Ensure all tests pass before submitting PR
3. Maintain test coverage above 80%
4. Follow existing test patterns and naming conventions

## Deployment

The app is configured for deployment on Vercel with automatic testing in CI/CD pipeline.

## License

MIT License
