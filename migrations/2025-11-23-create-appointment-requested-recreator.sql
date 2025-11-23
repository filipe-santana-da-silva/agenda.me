-- Migration: Create AppointmentRequestedRecreator join table
-- Adds a proper many-to-many relation between Appointment and Recreator

CREATE TABLE IF NOT EXISTS "AppointmentRequestedRecreator" (
  appointment_id uuid NOT NULL,
  recreator_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_appointment_requested_recreator PRIMARY KEY (appointment_id, recreator_id),
  CONSTRAINT fk_arr_appointment FOREIGN KEY (appointment_id) REFERENCES "Appointment" (id) ON DELETE CASCADE,
  CONSTRAINT fk_arr_recreator FOREIGN KEY (recreator_id) REFERENCES "Recreator" (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_arr_recreator_id ON "AppointmentRequestedRecreator" (recreator_id);
CREATE INDEX IF NOT EXISTS idx_arr_appointment_id ON "AppointmentRequestedRecreator" (appointment_id);
