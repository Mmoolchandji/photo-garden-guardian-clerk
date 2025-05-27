
import { useState } from 'react';
import PhotoCard from './PhotoCard';
import PhotoModal from './PhotoModal';

interface Photo {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

const mockPhotos: Photo[] = [
  {
    id: '1',
    title: 'Morning Dew on Roses',
    description: 'Delicate water droplets rest on vibrant red rose petals, capturing the essence of a peaceful garden morning.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Sunflower Field Glory',
    description: 'A magnificent field of sunflowers stretching toward the horizon, their faces following the golden sun.',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop',
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    title: 'Butterfly Garden Dance',
    description: 'A colorful butterfly gracefully dances among the lavender blooms in this enchanting garden scene.',
    imageUrl: 'https://images.unsplash.com/photo-1444927714506-8492d94b5ba0?w=600&h=400&fit=crop',
    createdAt: '2024-01-13'
  },
  {
    id: '4',
    title: 'Zen Garden Tranquility',
    description: 'Perfectly arranged stones and carefully raked sand create a meditative space in this Japanese-inspired garden.',
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop',
    createdAt: '2024-01-12'
  },
  {
    id: '5',
    title: 'Spring Cherry Blossoms',
    description: 'Delicate pink cherry blossoms create a dreamy canopy, celebrating the arrival of spring in the garden.',
    imageUrl: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&h=400&fit=crop',
    createdAt: '2024-01-11'
  },
  {
    id: '6',
    title: 'Herb Garden Abundance',
    description: 'Fresh basil, rosemary, and thyme thrive in this aromatic herb garden, ready for culinary adventures.',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
    createdAt: '2024-01-10'
  },
  {
    id: '7',
    title: 'Water Lily Serenity',
    description: 'Elegant white water lilies float peacefully on a still pond, creating perfect reflections.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
    createdAt: '2024-01-09'
  },
  {
    id: '8',
    title: 'Cottage Garden Charm',
    description: 'A rustic cottage garden overflows with wildflowers, creating a whimsical and natural landscape.',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
    createdAt: '2024-01-08'
  }
];

interface PhotoGridProps {
  viewMode: 'grid' | 'list';
}

const PhotoGrid = ({ viewMode }: PhotoGridProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  return (
    <>
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Gallery Collection</h3>
        <p className="text-gray-600">Explore our curated selection of garden photography</p>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={() => setSelectedPhoto(photo)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {mockPhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="flex space-x-4">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{photo.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{photo.description}</p>
                  <p className="text-xs text-gray-400">Added {photo.createdAt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PhotoModal
        photo={selectedPhoto}
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </>
  );
};

export default PhotoGrid;
