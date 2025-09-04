
import SearchAndFilters, { FilterState } from './SearchAndFilters';
import MobileLoadingState from './MobileLoadingState';

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
        photosCount={0}
        onSelectAll={() => {}}
        isAllSelected={false}
        isSelectionMode={false}
      />
      <MobileLoadingState message="Loading photos..." />
    </div>
  );
};

export default PhotoLoadingState;
