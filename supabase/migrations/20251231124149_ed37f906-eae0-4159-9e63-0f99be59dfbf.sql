-- Allow anyone to insert registrations (public form)
CREATE POLICY "Anyone can insert registrations"
ON public.sangat_registrations
FOR INSERT
TO public
WITH CHECK (true);

-- Drop the restrictive admin-only insert policy
DROP POLICY IF EXISTS "Admins can insert registrations" ON public.sangat_registrations;