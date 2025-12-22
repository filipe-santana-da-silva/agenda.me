-- Adicionar campos para sistema de lembretes na tabela appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS presence_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;