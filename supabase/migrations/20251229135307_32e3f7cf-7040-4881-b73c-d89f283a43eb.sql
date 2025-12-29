-- Create enum for yes/no fields
CREATE TYPE public.yes_no AS ENUM ('Yes', 'No');

-- Create the sangat_registrations table
CREATE TABLE public.sangat_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  alternate_mobile_number TEXT,
  emergency_contact_number TEXT NOT NULL,
  aadhaar_number TEXT NOT NULL,
  address TEXT,
  age INTEGER,
  bp TEXT,
  hypertension yes_no,
  sugar yes_no,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sangat_registrations ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('sangat-images', 'sangat-images', true);

-- Create admin role enum
CREATE TYPE public.app_role AS ENUM ('admin');

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for sangat_registrations (admin only)
CREATE POLICY "Admins can view all registrations"
ON public.sangat_registrations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert registrations"
ON public.sangat_registrations
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update registrations"
ON public.sangat_registrations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete registrations"
ON public.sangat_registrations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policy for user_roles (users can view their own roles)
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Storage policies for sangat-images bucket
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'sangat-images');

CREATE POLICY "Anyone can view sangat images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'sangat-images');