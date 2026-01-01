-- Make user_id optional in reminders table
ALTER TABLE reminders 
ALTER COLUMN user_id DROP NOT NULL;

-- Update the RLS policy to allow NULL user_id
DROP POLICY IF EXISTS "Users can insert their own reminders" ON reminders;

CREATE POLICY "Users can insert their own reminders"
  ON reminders
  FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Update RLS policy for select to allow public/NULL user_id records
DROP POLICY IF EXISTS "Users can view their own reminders" ON reminders;

CREATE POLICY "Users can view their own reminders"
  ON reminders
  FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);
