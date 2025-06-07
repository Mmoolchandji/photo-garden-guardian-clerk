
const PhotoEmptyState = () => {
  return (
    <div className="bg-gray-50 rounded-lg p-8 text-center">
      <h4 className="text-lg font-medium text-gray-900 mb-2">No photos found</h4>
      <p className="text-gray-500 mb-4">
        Try adjusting your search criteria or clearing filters to see more results.
      </p>
    </div>
  );
};

export default PhotoEmptyState;
