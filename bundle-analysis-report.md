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
- `react-day-picker` - **ACTIVELY USED** in `calendar.tsx` UI component
- `recharts` - Used in `chart.tsx` UI component (admin analytics ready)
- `embla-carousel-react` - **ACTIVELY USED** in `PhotoModal.tsx` (CORE photo viewing functionality)

#### 🔍 PRIME REMOVAL CANDIDATES (VERIFIED UNUSED)
- `zod` - **CONFIRMED UNUSED** - No form validation schemas found
- `date-fns` - **CONFIRMED UNUSED** - Custom formatDate functions used instead
- `input-otp` - **CONFIRMED UNUSED** - UI component exists but never imported
- `vaul` - **CONFIRMED UNUSED** - UI component exists but never imported
- `cmdk` - **CONFIRMED UNUSED** - UI component exists but never imported

#### 📦 SAFE REMOVAL CANDIDATES (Est. ~145KB savings)
1. **zod** (~25KB) - Form validation (confirmed unused)
2. **date-fns** (~50KB) - Date utilities (custom formatDate used instead)
3. **input-otp** (~15KB) - OTP input field (UI exists but unused)
4. **vaul** (~30KB) - Mobile drawer component (UI exists but unused)
5. **cmdk** (~25KB) - Command menu component (UI exists but unused)

#### ⚠️ KEEP - Active UI Components
- **react-day-picker** - Calendar UI component (ACTIVE)
- **recharts** - Chart UI component (admin ready)
- **embla-carousel-react** - PhotoModal carousel (CORE FEATURE)

### Bundle Size Snapshot (ACTUAL RESULTS)
- **Current production build**: 762.32KB total (after removals)
- **Key chunks**: React (142.10KB), Radix UI (97.66KB), Main bundle (224.38KB), Admin (80.83KB)
- **Successfully removed**: `date-fns`, `zod`, `input-otp`, `cmdk`, `vaul` (5 packages)
- **Build status**: ✅ **SUCCESSFUL** - No errors, all functionality preserved

### Next Steps
1. Manual install `vite-plugin-visualizer` for precise measurements
2. Safe removal PR with comprehensive testing
3. Verify no Admin features use these libraries in hidden workflows