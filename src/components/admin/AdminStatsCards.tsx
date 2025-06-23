
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Grid, Settings } from 'lucide-react';
import { Photo } from '@/types/photo';

interface AdminStatsCardsProps {
  photos: Photo[];
}

const AdminStatsCards = ({ photos }: AdminStatsCardsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Your Photos</CardTitle>
        <Camera className="h-4 w-4 text-emerald-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{photos.length}</div>
        <p className="text-xs text-gray-500">
          {photos.length === 0
            ? 'Ready to add your first photo'
            : 'Photos in your gallery'}
        </p>
      </CardContent>
    </Card>
    {/* <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Legacy Photos</CardTitle>
        <Grid className="h-4 w-4 text-emerald-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{photos.filter(p => p.legacy).length}</div>
        <p className="text-xs text-gray-500">Photos from before user accounts</p>
      </CardContent>
    </Card> */}
    {/* <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
        <Settings className="h-4 w-4 text-emerald-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">-</div>
        <p className="text-xs text-gray-500">Storage tracking coming soon</p>
      </CardContent>
    </Card> */}
  </div>
);

export default AdminStatsCards;
