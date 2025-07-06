
export interface Photo {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
  fabric?: string;
  price?: number;
  stock_status?: string;
  user_id: string;
  legacy?: boolean;
  sort_order?: number;
}

export interface PhotoCardData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  price?: number;
}
