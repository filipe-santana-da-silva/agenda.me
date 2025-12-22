-- Adicionar campos de horários de trabalho na tabela employees
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS work_start TIME DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS work_end TIME DEFAULT '18:00',
ADD COLUMN IF NOT EXISTS lunch_start TIME DEFAULT '12:00',
ADD COLUMN IF NOT EXISTS lunch_end TIME DEFAULT '13:00',
ADD COLUMN IF NOT EXISTS break_intervals JSONB DEFAULT '[]';