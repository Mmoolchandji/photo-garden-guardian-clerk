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
**Candidates: `date-fns`, `react-day-picker`**
```bash
npm uninstall date-fns react-day-picker
```
- ✅ Custom `formatDate` already implemented
- ✅ No calendar components found
- ⚠️ Test: Gallery date display still works

### Phase 3: Safe Removal Batch 2 (Medium Risk)
**Candidates: `zod`, `input-otp`, `cmdk`**
```bash
npm uninstall zod input-otp cmdk
```
- ✅ No form validation schemas found
- ✅ No OTP input components found
- ✅ No command palette features found
- ⚠️ Test: All forms still work (especially photo upload/edit)

### Phase 4: Safe Removal Batch 3 (Higher Risk - Admin Features)
**Candidates: `recharts`, `embla-carousel-react`, `vaul`**
```bash
npm uninstall recharts embla-carousel-react vaul
```
- ❓ **VERIFY FIRST**: No admin analytics/charts
- ❓ **VERIFY FIRST**: No carousel components in admin
- ❓ **VERIFY FIRST**: No mobile drawer menus
- ⚠️ Test: Full admin functionality walkthrough

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

**Estimated Total Savings**: 200-300KB (25-30% reduction)
**Risk Level**: Low-Medium (with proper testing)
**Timeline**: 2-3 incremental PRs over 1-2 days