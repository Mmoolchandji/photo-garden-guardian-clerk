
-- Add user_id column to photos table (nullable initially for migration)
ALTER TABLE public.photos 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add legacy flag column
ALTER TABLE public.photos 
ADD COLUMN legacy BOOLEAN DEFAULT FALSE;

-- Create a function to assign legacy photos to the first admin user who logs in
CREATE OR REPLACE FUNCTION public.assign_legacy_photos_to_first_admin()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if there are any photos with null user_id (legacy photos)
  IF EXISTS (SELECT 1 FROM public.photos WHERE user_id IS NULL) THEN
    -- Assign all legacy photos to this user and mark them as legacy
    UPDATE public.photos 
    SET user_id = NEW.id, legacy = TRUE 
    WHERE user_id IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign legacy photos to first admin
CREATE TRIGGER assign_legacy_photos_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_legacy_photos_to_first_admin();

-- Drop existing overly permissive RLS policies on photos table
DROP POLICY IF EXISTS "Anyone can view photos" ON public.photos;
DROP POLICY IF EXISTS "Authenticated users can create photos" ON public.photos;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON public.photos;
DROP POLICY IF EXISTS "Authenticated users can update photos" ON public.photos;

-- Create user-specific RLS policies for photos table
CREATE POLICY "Users can view their own photos" 
  ON public.photos 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own photos" 
  ON public.photos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos" 
  ON public.photos 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" 
  ON public.photos 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Update storage bucket policies for user-specific access
-- Drop existing overly permissive storage policies
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON storage.objects;

-- Create user-specific storage policies
CREATE POLICY "Users can view their own photos in storage" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own photos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own photos in storage" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos in storage" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
