-- Migration: Add instructor and business partner initialization
-- This migration auto-creates instructor/business records when users sign up with those roles

-- Trigger function to create instructor record when new instructor user is created
CREATE OR REPLACE FUNCTION public.handle_new_instructor()
RETURNS TRIGGER AS $$
BEGIN
  -- If user role is 'instructor', create instructor record linked to a default partner
  IF NEW.role = 'instructor' THEN
    -- Get or create default partner for this instructor
    INSERT INTO public.partners (name, slug, settings)
    VALUES (
      NEW.display_name || ' (Instructor)',
      'instructor-' || NEW.id,
      jsonb_build_object('created_for_user', NEW.id)
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Get the partner ID we just created or existing one
    WITH partner_record AS (
      SELECT id FROM public.partners 
      WHERE slug = 'instructor-' || NEW.id
      LIMIT 1
    )
    INSERT INTO public.instructors (partner_id, user_id, role, joined_at)
    SELECT 
      p.id,
      NEW.id,
      'instructor',
      NOW()
    FROM partner_record p
    ON CONFLICT (partner_id, user_id) DO NOTHING;
  END IF;

  -- If user role is 'business', create partner record
  IF NEW.role = 'business' THEN
    INSERT INTO public.partners (name, slug, settings)
    VALUES (
      NEW.display_name || ' (Partner)',
      'partner-' || NEW.id,
      jsonb_build_object('created_for_user', NEW.id, 'type', 'business')
    )
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_user_created_setup_role ON public.users;

-- Create trigger to call the function when user role is set to instructor or business
CREATE TRIGGER on_user_created_setup_role
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_instructor();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_partners_slug ON public.partners(slug);
CREATE INDEX IF NOT EXISTS idx_instructors_user_id ON public.instructors(user_id);
