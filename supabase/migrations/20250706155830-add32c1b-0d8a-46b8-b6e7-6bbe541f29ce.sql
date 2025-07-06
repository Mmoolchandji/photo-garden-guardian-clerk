-- Add sort_order column to photos table
ALTER TABLE public.photos 
ADD COLUMN sort_order INTEGER;

-- Create function to initialize sort order for existing photos
CREATE OR REPLACE FUNCTION public.initialize_photo_sort_order()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update existing photos with sort order based on creation date (newest first)
  WITH ordered_photos AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as new_sort_order
    FROM public.photos
    WHERE sort_order IS NULL
  )
  UPDATE public.photos 
  SET sort_order = ordered_photos.new_sort_order
  FROM ordered_photos
  WHERE photos.id = ordered_photos.id;
END;
$$;

-- Initialize sort order for existing photos
SELECT public.initialize_photo_sort_order();

-- Create function to auto-assign sort order for new photos
CREATE OR REPLACE FUNCTION public.assign_sort_order_to_new_photo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If sort_order is not provided, assign it based on creation date (newest first)
  IF NEW.sort_order IS NULL THEN
    SELECT COALESCE(MIN(sort_order), 0) - 1
    INTO NEW.sort_order
    FROM public.photos
    WHERE user_id = NEW.user_id;
    
    -- If no photos exist for this user, start with 1
    IF NEW.sort_order IS NULL THEN
      NEW.sort_order := 1;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign sort order to new photos
CREATE TRIGGER assign_sort_order_before_insert
  BEFORE INSERT ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_sort_order_to_new_photo();