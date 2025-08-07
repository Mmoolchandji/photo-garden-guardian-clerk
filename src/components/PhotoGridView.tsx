import { Photo, PhotoCardData } from '@/types/photo';
import PhotoCard from './PhotoCard';
import CompactPhotoCard from './CompactPhotoCard';
import { useEffect, useMemo, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';

interface PhotoGridViewProps {
  photos: Photo[];
  viewMode: 'grid' | 'compact';
  onPhotoClick: (photo: Photo) => void;
}

const PhotoGridView = ({ photos, viewMode, onPhotoClick }: PhotoGridViewProps) => {
  const transformPhotoData = (photo: Photo): PhotoCardData => ({
    id: photo.id,
    title: photo.title,
    description: photo.description || '',
    imageUrl: photo.image_url,
    createdAt: new Date(photo.created_at).toLocaleDateString(),
    price: photo.price,
  });

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-4 py-4 content-visibility-auto">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={transformPhotoData(photo)}
            onClick={() => onPhotoClick(photo)}
          />
        ))}
      </div>
    );
  }

  // Compact view - window-virtualized rows for maximum density on mobile
  // Virtualize by rows based on responsive breakpoints
  return <VirtualizedCompactGrid photos={photos} onPhotoClick={onPhotoClick} transformPhotoData={transformPhotoData} />;
};

export default PhotoGridView;

// Virtualized Compact Grid

type TransformFn = (photo: Photo) => PhotoCardData;

const VirtualizedCompactGrid = ({
  photos,
  onPhotoClick,
  transformPhotoData,
}: {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  transformPhotoData: TransformFn;
}) => {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const cols = w < 640 ? 4 : w < 768 ? 5 : w < 1024 ? 6 : 8;
      setColumns(cols);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const rowCount = Math.ceil(photos.length / columns);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 160, // approximate row height
    overscan: 4,
  });

  const rows = useMemo(() => {
    const r: Photo[][] = [];
    for (let i = 0; i < rowCount; i++) {
      const start = i * columns;
      r.push(photos.slice(start, start + columns));
    }
    return r;
  }, [photos, columns, rowCount]);

  return (
    <div className="relative w-full content-visibility-auto" style={{ height: virtualizer.getTotalSize() }}>
      {virtualizer.getVirtualItems().map((virtualRow) => (
        <div
          key={virtualRow.key}
          className="absolute left-0 w-full"
          style={{ transform: `translateY(${virtualRow.start}px)` }}
        >
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1 py-2">
            {rows[virtualRow.index]?.map((photo) => (
              <CompactPhotoCard
                key={photo.id}
                photo={transformPhotoData(photo)}
                onClick={() => onPhotoClick(photo)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
