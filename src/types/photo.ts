
export interface Photo {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
  fabric?: string;
  price?: number;
  stock_status?: string;
}

export interface PhotoCardData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  price?: number;
}
