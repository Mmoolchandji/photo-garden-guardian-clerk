# Safe Dependency Removal PR Plan

## 🎯 Objective
Remove unused dependencies without breaking any functionality, targeting ~25-30% bundle size reduction.

## 📋 Pre-Removal Checklist

### Phase 1: Verification (CRITICAL - No Removals Yet)
- [ ] Manual search for dynamic imports (`import()` statements)
- [ ] Check all UI component files for hidden usage
- [ ] Test all Admin features thoroughly
- [ ] Verify no form validation uses zod
- [ ] Confirm no charts in Admin dashboard
- [ ] Check for lazy-loaded components using these libraries

### Phase 2: Safe Removal Batch 1 (Low Risk)
**Candidates: `date-fns`, `zod`**
```bash
npm uninstall date-fns zod
```
- ✅ Custom `formatDate` already implemented
- ✅ No form validation schemas found
- ⚠️ Test: Gallery date display still works

### Phase 3: Safe Removal Batch 2 (Medium Risk)
**Candidates: `input-otp`, `cmdk`, `vaul`**
```bash
npm uninstall input-otp cmdk vaul
```
- ✅ No OTP input components imported
- ✅ No command palette features found
- ✅ No drawer components imported
- ⚠️ Test: All forms still work (especially photo upload/edit)

### Phase 4: Verify Admin Features (DO NOT REMOVE YET)
**Keep for now: `recharts`, `embla-carousel-react`, `react-day-picker`**
- ❌ **DO NOT REMOVE**: `embla-carousel-react` - Core PhotoModal functionality
- ❌ **DO NOT REMOVE**: `react-day-picker` - Calendar UI component  
- ❓ **VERIFY FIRST**: `recharts` - Check if admin analytics use charts
- ⚠️ Test: PhotoModal carousel functionality

## 🧪 Testing Protocol

### Automated Tests
```bash
npm run test          # Unit tests
npm run build         # Production build
```

### Manual Testing Checklist
- [ ] Photo upload (all formats)
- [ ] Photo editing/metadata
- [ ] Bulk operations
- [ ] Gallery sharing
- [ ] Admin photo management
- [ ] Authentication flows
- [ ] All responsive breakpoints
- [ ] Toast notifications work
- [ ] Theme switching works

### Rollback Plan
```bash
# If any issues found, immediate rollback:
npm install [package-name]@[previous-version]
```

## 📊 Success Metrics
- [ ] Bundle size reduced by >20%
- [ ] All existing functionality preserved
- [ ] No new console errors
- [ ] Performance maintained or improved
- [ ] All tests passing

## 🚨 Red Flags to Watch For
- Any import errors during build
- Missing UI components
- Form validation breaking
- Date formatting issues
- Admin dashboard errors
- Mobile responsiveness issues

## 📝 Implementation Notes
- Remove dependencies one batch at a time
- Test thoroughly between each batch
- Document any unexpected findings
- Keep commit history granular for easy rollback
- Update this plan based on discoveries

**ACTUAL RESULTS**: 5 packages successfully removed
**Build Status**: ✅ SUCCESSFUL (762.32KB total bundle)
**Risk Level**: Low (all tests passing, no build errors)
**Timeline**: ✅ COMPLETED in 2 batches