-- Create enum for gender
CREATE TYPE public.gender AS ENUM ('Male', 'Female');

-- Add gender column to sangat_registrations table
ALTER TABLE public.sangat_registrations 
ADD COLUMN gender gender;

-- Remove the BP column as it's no longer needed
ALTER TABLE public.sangat_registrations 
DROP COLUMN IF EXISTS bp;
