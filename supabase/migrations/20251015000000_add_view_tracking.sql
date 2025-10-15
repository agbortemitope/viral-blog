-- Add view count column to posts table
ALTER TABLE public.posts 
ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;

-- Create post_views table for tracking individual views
CREATE TABLE public.post_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  viewer_id TEXT, -- Can be user_id or anonymous identifier
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for post_views
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- Create policies for post_views
CREATE POLICY "Anyone can insert views" 
ON public.post_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Views are not readable by regular users" 
ON public.post_views 
FOR SELECT 
USING (false);

-- Create index for efficient querying
CREATE INDEX idx_post_views_post_id ON public.post_views(post_id);
CREATE INDEX idx_post_views_viewer_id ON public.post_views(viewer_id);
CREATE INDEX idx_post_views_created_at ON public.post_views(created_at);

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_post_view(
  p_post_id UUID,
  p_viewer_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_view_count INTEGER;
BEGIN
  -- Insert the view record
  INSERT INTO public.post_views (post_id, viewer_id, ip_address, user_agent)
  VALUES (p_post_id, p_viewer_id, p_ip_address, p_user_agent);
  
  -- Update and return the new view count
  UPDATE public.posts 
  SET view_count = view_count + 1 
  WHERE id = p_post_id
  RETURNING view_count INTO new_view_count;
  
  RETURN new_view_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;