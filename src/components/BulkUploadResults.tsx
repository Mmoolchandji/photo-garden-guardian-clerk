
interface BulkUploadResultsProps {
  uploadResults: { success: number; failed: string[] } | null;
}

const BulkUploadResults = ({ uploadResults }: BulkUploadResultsProps) => {
  if (!uploadResults) return null;

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-sm">
        <span className="font-medium text-green-600">
          {uploadResults.success} successful
        </span>
        {uploadResults.failed.length > 0 && (
          <span className="text-red-600 ml-2">
            • {uploadResults.failed.length} failed
          </span>
        )}
      </p>
    </div>
  );
};

export default BulkUploadResults;
