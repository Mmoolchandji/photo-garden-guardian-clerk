
import { Photo, PhotoCardData } from '@/types/photo';
import { ShareablePhoto } from '@/utils/sharing';

export const transformPhotoToCardData = (photo: Photo): PhotoCardData => ({
  id: photo.id,
  title: photo.title,
  description: photo.description || '',
  imageUrl: photo.image_url,
  createdAt: new Date(photo.created_at).toLocaleDateString(),
  price: photo.price,
});

export const transformPhotoToShareable = (photo: Photo): ShareablePhoto => ({
  id: photo.id,
  title: photo.title,
  imageUrl: photo.image_url,
  price: photo.price,
  description: photo.description || undefined,
});

export const transformPhotosToShareable = (photos: Photo[]): ShareablePhoto[] => {
  return photos.map(transformPhotoToShareable);
};
