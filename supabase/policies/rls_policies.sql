-- RLS Policies for Appointments table
-- Enable RLS on Appointment table
ALTER TABLE public."Appointment" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view appointments they created (created_by = auth.email()) OR they own (userid = auth.uid())
-- ADMIN users can view all appointments
CREATE POLICY "Users can view their appointments or admin sees all"
  ON public."Appointment"
  FOR SELECT
  USING (
    -- Check if user is admin
    EXISTS (
      SELECT 1 FROM public.user_permission up
      JOIN public.role r ON r.id = up.role_id
      WHERE up.email = auth.jwt()->>'email'
      AND r.name = 'ADMIN'
    )
    -- OR user owns the appointment
    OR userid = auth.uid()
    -- OR user created the appointment
    OR created_by = auth.jwt()->>'email'
  );

-- Policy 2: Users can insert appointments with their own userid
CREATE POLICY "Users can create appointments"
  ON public."Appointment"
  FOR INSERT
  WITH CHECK (
    userid = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_permission up
      JOIN public.role r ON r.id = up.role_id
      WHERE up.email = auth.jwt()->>'email'
      AND r.name = 'ADMIN'
    )
  );

-- Policy 3: Users can update their own appointments OR admins can update any
CREATE POLICY "Users can update their own appointments"
  ON public."Appointment"
  FOR UPDATE
  USING (
    userid = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_permission up
      JOIN public.role r ON r.id = up.role_id
      WHERE up.email = auth.jwt()->>'email'
      AND r.name = 'ADMIN'
    )
  )
  WITH CHECK (
    userid = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_permission up
      JOIN public.role r ON r.id = up.role_id
      WHERE up.email = auth.jwt()->>'email'
      AND r.name = 'ADMIN'
    )
  );

-- Policy 4: Users can delete their own appointments OR admins can delete any
CREATE POLICY "Users can delete their own appointments"
  ON public."Appointment"
  FOR DELETE
  USING (
    userid = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_permission up
      JOIN public.role r ON r.id = up.role_id
      WHERE up.email = auth.jwt()->>'email'
      AND r.name = 'ADMIN'
    )
  );

-- RLS Policies for Reminder table
ALTER TABLE public."Reminder" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own reminders
CREATE POLICY "Users can view their reminders"
  ON public."Reminder"
  FOR SELECT
  USING (userid = auth.uid());

-- Policy 2: Users can create reminders
CREATE POLICY "Users can create reminders"
  ON public."Reminder"
  FOR INSERT
  WITH CHECK (userid = auth.uid());

-- Policy 3: Users can update their own reminders
CREATE POLICY "Users can update their own reminders"
  ON public."Reminder"
  FOR UPDATE
  USING (userid = auth.uid())
  WITH CHECK (userid = auth.uid());

-- Policy 4: Users can delete their own reminders
CREATE POLICY "Users can delete their own reminders"
  ON public."Reminder"
  FOR DELETE
  USING (userid = auth.uid());

-- RLS Policies for RankingEventDetail table
ALTER TABLE public."RankingEventDetail" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view ranking details for appointments they created (via appointmentid)
-- ADMIN users can view all ranking details
CREATE POLICY "Users can view ranking for their appointments or admin sees all"
  ON public."RankingEventDetail"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_permission up
      JOIN public.role r ON r.id = up.role_id
      WHERE up.email = auth.jwt()->>'email'
      AND r.name = 'ADMIN'
    )
    OR appointmentid IN (
      SELECT id FROM public."Appointment" WHERE userid = auth.uid()
    )
  );

-- Policy 2: Service role only for inserts/updates/deletes via API
CREATE POLICY "Service role can manage ranking details"
  ON public."RankingEventDetail"
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for AppointmentRequestedRecreator table
ALTER TABLE public."AppointmentRequestedRecreator" ENABLE ROW LEVEL SECURITY;

-- Policy: Allow access through appointments table
CREATE POLICY "Users can view requested recreators for their appointments"
  ON public."AppointmentRequestedRecreator"
  FOR SELECT
  USING (
    appointment_id IN (
      SELECT id FROM public."Appointment" WHERE userid = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_permission up
      JOIN public.role r ON r.id = up.role_id
      WHERE up.email = auth.jwt()->>'email'
      AND r.name = 'ADMIN'
    )
  );

CREATE POLICY "Users can insert requested recreators for their appointments"
  ON public."AppointmentRequestedRecreator"
  FOR INSERT
  WITH CHECK (
    appointment_id IN (
      SELECT id FROM public."Appointment" WHERE userid = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_permission up
      JOIN public.role r ON r.id = up.role_id
      WHERE up.email = auth.jwt()->>'email'
      AND r.name = 'ADMIN'
    )
  );

CREATE POLICY "Users can delete requested recreators for their appointments"
  ON public."AppointmentRequestedRecreator"
  FOR DELETE
  USING (
    appointment_id IN (
      SELECT id FROM public."Appointment" WHERE userid = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_permission up
      JOIN public.role r ON r.id = up.role_id
      WHERE up.email = auth.jwt()->>'email'
      AND r.name = 'ADMIN'
    )
  );
