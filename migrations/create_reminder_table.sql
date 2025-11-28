-- Create Reminder table
CREATE TABLE IF NOT EXISTS public."Reminder" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  reminderdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  createdat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updatedat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reminder_userid ON public."Reminder"(userid);
CREATE INDEX IF NOT EXISTS idx_reminder_reminderdate ON public."Reminder"(reminderdate);

-- Enable RLS (Row Level Security)
ALTER TABLE public."Reminder" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own reminders" ON public."Reminder";
CREATE POLICY "Users can view their own reminders"
  ON public."Reminder"
  FOR SELECT
  USING (userid = auth.uid());

DROP POLICY IF EXISTS "Users can create their own reminders" ON public."Reminder";
CREATE POLICY "Users can create their own reminders"
  ON public."Reminder"
  FOR INSERT
  WITH CHECK (userid = auth.uid());

DROP POLICY IF EXISTS "Users can update their own reminders" ON public."Reminder";
CREATE POLICY "Users can update their own reminders"
  ON public."Reminder"
  FOR UPDATE
  USING (userid = auth.uid())
  WITH CHECK (userid = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own reminders" ON public."Reminder";
CREATE POLICY "Users can delete their own reminders"
  ON public."Reminder"
  FOR DELETE
  USING (userid = auth.uid());
