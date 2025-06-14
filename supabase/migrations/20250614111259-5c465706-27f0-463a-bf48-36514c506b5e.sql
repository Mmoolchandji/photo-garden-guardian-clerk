
-- Create a table for shared galleries
CREATE TABLE public.shared_galleries (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  photos JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  include_business_info BOOLEAN NOT NULL DEFAULT true,
  watermark BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security for shared galleries
ALTER TABLE public.shared_galleries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to non-expired galleries
CREATE POLICY "Public read access to non-expired galleries" 
  ON public.shared_galleries 
  FOR SELECT 
  USING (expires_at > now());

-- Create policy to allow anyone to insert galleries (for gallery creation)
CREATE POLICY "Allow gallery creation" 
  ON public.shared_galleries 
  FOR INSERT 
  WITH CHECK (true);
