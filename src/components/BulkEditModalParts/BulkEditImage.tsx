
import { Photo } from '@/types/photo';

type Props = {
  photo: Photo;
};

export default function BulkEditImage({ photo }: Props) {
  return (
    <div>
      <img
        src={photo.image_url}
        alt={photo.title}
        className="w-full h-40 object-cover rounded-lg mb-4"
        width={400}
        height={160}
      />
    </div>
  );
}
