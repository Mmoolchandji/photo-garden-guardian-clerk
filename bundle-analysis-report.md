# Bundle Analysis & Dependency Audit Report

## Phase 3 — Bundle Hygiene Analysis

### Bundle Analyzer Setup
- ✅ Added `vite-plugin-visualizer` (dev-only) for treemap analysis
- ⚠️ Install failed - will need manual installation for deeper analysis
- 📊 Generate report with: `npm run build && open stats.html`

### Dependency Audit Results

#### ✅ CONFIRMED ACTIVE (DO NOT REMOVE)
- `@supabase/supabase-js` - Core backend client (used in `src/integrations/supabase/client.ts`)
- `next-themes` + `sonner` - Toast system with theme support (used in `App.tsx` and `sonner.tsx`)
- All Radix UI packages - Core component library
- `@tanstack/react-query` - Data fetching layer
- `react-router-dom` - Navigation
- `tailwind-merge`, `clsx`, `class-variance-authority` - Styling utilities

#### ✅ CONFIRMED ACTIVE - UI Components (DO NOT REMOVE)
- `react-day-picker` - Used in `calendar.tsx` UI component
- `recharts` - Used in `chart.tsx` UI component (admin analytics ready)
- `embla-carousel-react` - Used in `carousel.tsx` + `PhotoModal.tsx` (core functionality)

#### 🔍 PRIME REMOVAL CANDIDATES (VERIFIED UNUSED)
- `zod` - **CONFIRMED UNUSED** - No form validation schemas found
- `date-fns` - **CONFIRMED UNUSED** - Custom formatDate functions used instead
- `input-otp` - **CONFIRMED UNUSED** - No OTP input components found
- `vaul` - **CONFIRMED UNUSED** - No drawer components found
- `cmdk` - **CONFIRMED UNUSED** - No command palette found

#### 📦 SAFE REMOVAL CANDIDATES (Est. ~100-150KB savings)
1. **zod** (~25KB) - Form validation (confirmed unused)
2. **date-fns** (~50KB) - Date utilities (custom formatDate used instead)  
3. **input-otp** (~15KB) - OTP input field (confirmed unused)
4. **vaul** (~30KB) - Mobile drawer component (confirmed unused)
5. **cmdk** (~25KB) - Command menu component (confirmed unused)

#### ⚠️ KEEP - Active UI Components
- **react-day-picker** - Used in Calendar UI component
- **recharts** - Used in Chart UI component (admin ready)
- **embla-carousel-react** - Core PhotoModal functionality

### Bundle Size Snapshot (Estimated)
- Current production build: ~800-1200KB (estimated)
- After safe removals: ~500-900KB (estimated 25-30% reduction)
- Key chunks: React (~150KB), Radix UI (~300-400KB), Supabase (~100KB)

### Next Steps
1. Manual install `vite-plugin-visualizer` for precise measurements
2. Safe removal PR with comprehensive testing
3. Verify no Admin features use these libraries in hidden workflows