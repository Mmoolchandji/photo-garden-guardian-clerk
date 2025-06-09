
import { AlertCircle, FileImage, Package, Globe, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ShareMethodRecommendationProps {
  photoCount: number;
  onMethodSelect: (method: 'files' | 'batched' | 'gallery') => void;
}

export const getRecommendedMethod = (photoCount: number): 'files' | 'batched' | 'gallery' => {
  if (photoCount <= 10) return 'files';
  if (photoCount <= 25) return 'batched';
  return 'gallery';
};

const ShareMethodRecommendation = ({ photoCount, onMethodSelect }: ShareMethodRecommendationProps) => {
  const recommendedMethod = getRecommendedMethod(photoCount);
  
  const methods = [
    {
      id: 'files' as const,
      title: 'Share as Files',
      description: 'Best for small collections',
      icon: FileImage,
      recommended: recommendedMethod === 'files',
      available: photoCount <= 10,
      benefits: ['High quality', 'Instant download', 'Works offline'],
      limitations: photoCount > 10 ? ['Limited to 10 photos max'] : [],
    },
    {
      id: 'batched' as const,
      title: 'Share in Batches',
      description: 'Split into multiple WhatsApp messages',
      icon: Package,
      recommended: recommendedMethod === 'batched',
      available: photoCount > 10 && photoCount <= 50,
      benefits: ['High quality files', 'Organized in parts', 'Reliable delivery'],
      limitations: photoCount > 50 ? ['Too many photos for batching'] : ['Multiple messages'],
    },
    {
      id: 'gallery' as const,
      title: 'Create Gallery Link',
      description: 'Professional gallery webpage',
      icon: Globe,
      recommended: recommendedMethod === 'gallery',
      available: photoCount > 5,
      benefits: ['Professional look', 'All photos in one place', 'Easy to browse'],
      limitations: ['Requires internet', 'Link expires in 48h'],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Zap className="h-4 w-4" />
        <span>Smart recommendations for {photoCount} photos:</span>
      </div>
      
      <div className="grid gap-3">
        {methods.map((method) => (
          <Card 
            key={method.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              method.recommended 
                ? 'ring-2 ring-emerald-500 bg-emerald-50' 
                : method.available 
                  ? 'hover:bg-gray-50' 
                  : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => method.available && onMethodSelect(method.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    method.recommended 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <method.icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{method.title}</h3>
                      {method.recommended && (
                        <Badge variant="default" className="bg-emerald-600">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                    
                    <div className="space-y-1">
                      {method.benefits.map((benefit, index) => (
                        <div key={index} className="text-xs text-emerald-600 flex items-center gap-1">
                          <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                          {benefit}
                        </div>
                      ))}
                      
                      {method.limitations.map((limitation, index) => (
                        <div key={index} className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {limitation}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ShareMethodRecommendation;
