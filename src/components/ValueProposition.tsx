
import { Camera, Tag, Share2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ValueProposition = () => {
  const features = [
    {
      icon: Camera,
      title: "Upload & Organize",
      description: "Easily upload and manage your saree photo collection with smart organization tools."
    },
    {
      icon: Tag,
      title: "Tag Everything",
      description: "Add fabric types, stock status, prices, and descriptions to keep track of your inventory."
    },
    {
      icon: Share2,
      title: "Share Instantly",
      description: "Share saree photos via WhatsApp or custom links with customers and social media."
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Professional photo management to help showcase and sell your saree collection."
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Perfect for Saree
            <span className="text-emerald-600 block">Business Owners</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Transform your saree business with professional photo management. 
            Upload, organize, tag, and share your beautiful collection with ease. 
            Built specifically for fashion retailers who want to showcase their inventory professionally.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-3">
                Get Started Free
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-lg px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
