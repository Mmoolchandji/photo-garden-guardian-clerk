
import PhotoCard from '@/components/PhotoCard';
import { transformPhotoToCardData } from '@/utils/photoTransform';

const DemoGallery = () => {
  const demoPhotos = [
    {
      id: '1',
      title: 'Silk Banarasi Saree',
      description: 'Beautiful traditional red silk saree with golden border work',
      fabric: 'Silk',
      price: 4500,
      stock_status: 'In Stock',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop',
      created_at: '2024-01-15',
      user_id: 'demo'
    },
    {
      id: '2',
      title: 'Cotton Handloom Saree',
      description: 'Elegant blue cotton saree with traditional block prints',
      fabric: 'Cotton',
      price: 2800,
      stock_status: 'Low Stock',
      image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=600&fit=crop',
      created_at: '2024-01-14',
      user_id: 'demo'
    },
    {
      id: '3',
      title: 'Georgette Party Wear',
      description: 'Stunning purple georgette saree perfect for evening events',
      fabric: 'Georgette',
      price: 3200,
      stock_status: 'In Stock',
      image_url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=600&fit=crop',
      created_at: '2024-01-13',
      user_id: 'demo'
    },
    {
      id: '4',
      title: 'Chiffon Designer Saree',
      description: 'Light weight pink chiffon with intricate embroidery work',
      fabric: 'Chiffon',
      price: 5200,
      stock_status: 'In Stock',
      image_url: 'https://images.unsplash.com/photo-1617627423056-892c6f81bf6e?w=400&h=600&fit=crop',
      created_at: '2024-01-12',
      user_id: 'demo'
    }
  ];

  return (
    <section className="py-8 px-2 sm:px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            See How It Works
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
            Here's how your saree collection would look in Photo Garden Keeper. 
            Each photo can be tagged with fabric type, pricing, and stock status for easy inventory management.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-4">
          {demoPhotos.map((photo) => (
            <PhotoCard key={photo.id} photo={transformPhotoToCardData(photo)} onClick={() => {}} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DemoGallery;
