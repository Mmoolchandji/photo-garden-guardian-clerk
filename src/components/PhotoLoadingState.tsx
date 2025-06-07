
import SearchAndFilters, { FilterState } from './SearchAndFilters';

interface PhotoLoadingStateProps {
  filters: FilterState;
  updateFilters: (filters: FilterState) => void;
  clearAllFilters: () => void;
}

const PhotoLoadingState = ({ filters, updateFilters, clearAllFilters }: PhotoLoadingStateProps) => {
  return (
    <div>
      <SearchAndFilters
        filters={filters}
        onChange={updateFilters}
        onClearAll={clearAllFilters}
      />
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading photos...</p>
      </div>
    </div>
  );
};

export default PhotoLoadingState;
