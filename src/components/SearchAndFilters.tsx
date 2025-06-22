
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SearchBar from './SearchBar';
import FabricFilter from './FabricFilter';
import StockStatusFilter from './StockStatusFilter';
import PriceRangeFilter from './PriceRangeFilter';
import { useAuth } from '@/contexts/AuthContext';

export interface FilterState {
  search: string;
  fabrics: string[];
  stockStatuses: string[];
  priceRange: string;
}

interface SearchAndFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClearAll: () => void;
}

const SearchAndFilters = ({ filters, onChange, onClearAll }: SearchAndFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateFilter = (key: keyof FilterState, value: string | string[]) => {
    if (!user) return; // Prevent filter changes for unauthenticated users
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = filters.search || 
                          filters.fabrics.length > 0 || 
                          filters.stockStatuses.length > 0 || 
                          filters.priceRange;

  const FiltersContent = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div className={!user ? 'opacity-50 pointer-events-none' : ''}>
        <FabricFilter
          selectedFabrics={filters.fabrics}
          onChange={(fabrics) => updateFilter('fabrics', fabrics)}
        />
      </div>
      <div className={!user ? 'opacity-50 pointer-events-none' : ''}>
        <StockStatusFilter
          selectedStatuses={filters.stockStatuses}
          onChange={(statuses) => updateFilter('stockStatuses', statuses)}
        />
      </div>
      <div className={!user ? 'opacity-50 pointer-events-none' : ''}>
        <PriceRangeFilter
          selectedRange={filters.priceRange}
          onChange={(range) => updateFilter('priceRange', range)}
        />
      </div>
      <div className="flex items-end">
        <Button
          variant="outline"
          onClick={onClearAll}
          disabled={!hasActiveFilters || !user}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      {/* Search Bar - Always Visible but disabled for unauthenticated users */}
      <div className="mb-4">
        <SearchBar
          value={filters.search}
          onChange={(search) => updateFilter('search', search)}
          placeholder={user ? "Search by title or description..." : "Sign in to search your photos..."}
          disabled={!user}
        />
      </div>

      {/* Unauthenticated User Message */}
      {!user && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center">
          <Lock className="h-4 w-4 text-emerald-600 mr-2" />
          <span className="text-sm text-emerald-700">Sign in to use filters and search your photo collection</span>
        </div>
      )}

      {/* Filters Section */}
      <div className="flex items-center gap-4">
        <div className="flex-grow">
          {isMobile ? (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between" disabled={!user}>
                  <span>Filters</span>
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <FiltersContent />
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <FiltersContent />
          )}
        </div>
        {isMobile && hasActiveFilters && user && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearAll}
            className="flex-shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && user && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {filters.search && `Search: "${filters.search}"`}
            {filters.fabrics.length > 0 && ` • Fabrics: ${filters.fabrics.length}`}
            {filters.stockStatuses.length > 0 && ` • Stock: ${filters.stockStatuses.length}`}
            {filters.priceRange && ` • Price: ${filters.priceRange}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;
