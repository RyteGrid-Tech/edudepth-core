-- EDUDEPTH SUPABASE AUTH FIX
-- Run this in the Supabase SQL Editor to fix the "Database error saving new user"

-- 1. Update the Trigger Function to handle Google OAuth and form metadata correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, class_level)
  VALUES (
    new.id,
    -- Google uses 'name', our form uses 'full_name'
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New Student'),
    new.email,
    -- Capture class_level if present, otherwise set to NULL to trigger "profile completion" flow
    new.raw_user_meta_data->>'class_level'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure class_level is nullable initially to allow OAuth users to sign up before picking a level
ALTER TABLE public.profiles ALTER COLUMN class_level DROP NOT NULL;

-- 3. (Optional but recommended) Refresh the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
