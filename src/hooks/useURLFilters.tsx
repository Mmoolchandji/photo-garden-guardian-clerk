
import { useState, useEffect } from 'react';
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

  // Load filters from URL on mount
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const fabrics = searchParams.get('fabrics')?.split(',').filter(Boolean) || [];
    const stockStatuses = searchParams.get('stock')?.split(',').filter(Boolean) || [];
    const priceRange = searchParams.get('price') || '';

    setFilters({
      search,
      fabrics,
      stockStatuses,
      priceRange
    });
  }, []);

  // Update URL when filters change
  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.fabrics.length > 0) params.set('fabrics', newFilters.fabrics.join(','));
    if (newFilters.stockStatuses.length > 0) params.set('stock', newFilters.stockStatuses.join(','));
    if (newFilters.priceRange) params.set('price', newFilters.priceRange);
    
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    const emptyFilters: FilterState = {
      search: '',
      fabrics: [],
      stockStatuses: [],
      priceRange: ''
    };
    updateFilters(emptyFilters);
  };

  return {
    filters,
    updateFilters,
    clearAllFilters
  };
};

export default useURLFilters;
