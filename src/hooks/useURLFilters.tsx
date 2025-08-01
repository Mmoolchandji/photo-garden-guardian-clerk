
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterState } from '@/components/SearchAndFilters';

const useURLFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    fabrics: [],
    stockStatuses: [],
    priceRange: ''
  });

  // Load filters from URL on mount - only run once
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const fabrics = searchParams.get('fabrics')?.split(',').filter(Boolean) || [];
    const stockStatuses = searchParams.get('stock')?.split(',').filter(Boolean) || ['Available'];
    const priceRange = searchParams.get('price') || '';

    const urlFilters = {
      search,
      fabrics,
      stockStatuses,
      priceRange
    };

    // Only update state if values actually changed
    setFilters(prevFilters => {
      const hasChanged = 
        prevFilters.search !== urlFilters.search ||
        JSON.stringify(prevFilters.fabrics) !== JSON.stringify(urlFilters.fabrics) ||
        JSON.stringify(prevFilters.stockStatuses) !== JSON.stringify(urlFilters.stockStatuses) ||
        prevFilters.priceRange !== urlFilters.priceRange;
      
      return hasChanged ? urlFilters : prevFilters;
    });
  }, [searchParams]);

  // Memoize the update function to prevent recreation on every render
  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(prevFilters => {
      // Prevent unnecessary updates if values haven't changed
      const hasChanged = 
        prevFilters.search !== newFilters.search ||
        JSON.stringify(prevFilters.fabrics) !== JSON.stringify(newFilters.fabrics) ||
        JSON.stringify(prevFilters.stockStatuses) !== JSON.stringify(newFilters.stockStatuses) ||
        prevFilters.priceRange !== newFilters.priceRange;
      
      if (!hasChanged) return prevFilters;
      
      // Update URL params
      const params = new URLSearchParams();
      
      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.fabrics.length > 0) params.set('fabrics', newFilters.fabrics.join(','));
      if (newFilters.stockStatuses.length > 0) params.set('stock', newFilters.stockStatuses.join(','));
      if (newFilters.priceRange) params.set('price', newFilters.priceRange);
      
      setSearchParams(params, { replace: true });
      
      return newFilters;
    });
  }, [setSearchParams]);

  const clearAllFilters = useCallback(() => {
    const emptyFilters: FilterState = {
      search: '',
      fabrics: [],
      stockStatuses: [],
      priceRange: ''
    };
    updateFilters(emptyFilters);
  }, [updateFilters]);

  return {
    filters,
    updateFilters,
    clearAllFilters
  };
};

export default useURLFilters;
