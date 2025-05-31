
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SearchBar from './SearchBar';
import FabricFilter from './FabricFilter';
import StockStatusFilter from './StockStatusFilter';
import PriceRangeFilter from './PriceRangeFilter';

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = filters.search || 
                          filters.fabrics.length > 0 || 
                          filters.stockStatuses.length > 0 || 
                          filters.priceRange;

  const FiltersContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <FabricFilter
        selectedFabrics={filters.fabrics}
        onChange={(fabrics) => updateFilter('fabrics', fabrics)}
      />
      <StockStatusFilter
        selectedStatuses={filters.stockStatuses}
        onChange={(statuses) => updateFilter('stockStatuses', statuses)}
      />
      <PriceRangeFilter
        selectedRange={filters.priceRange}
        onChange={(range) => updateFilter('priceRange', range)}
      />
      <div className="flex items-end">
        <Button
          variant="outline"
          onClick={onClearAll}
          disabled={!hasActiveFilters}
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
      {/* Search Bar - Always Visible */}
      <div className="mb-4">
        <SearchBar
          value={filters.search}
          onChange={(search) => updateFilter('search', search)}
          placeholder="Search by title or description..."
        />
      </div>

      {/* Filters Section */}
      {isMobile ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
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

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
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
