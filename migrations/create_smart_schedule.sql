-- Sistema de Agenda Inteligente

-- Configurações de horários de trabalho e intervalos
CREATE TABLE IF NOT EXISTS schedule_settings (
  id SERIAL PRIMARY KEY,
  professional_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=domingo, 6=sábado
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  lunch_start TIME,
  lunch_end TIME,
  break_intervals JSONB, -- [{"start": "10:00", "end": "10:15", "name": "Intervalo"}]
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bloqueios automáticos de horários
CREATE TABLE IF NOT EXISTS schedule_blocks (
  id SERIAL PRIMARY KEY,
  professional_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  block_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  block_type VARCHAR(50) NOT NULL, -- 'lunch', 'break', 'maintenance', 'personal'
  reason TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sugestões de reagendamento
CREATE TABLE IF NOT EXISTS reschedule_suggestions (
  id SERIAL PRIMARY KEY,
  original_appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
  suggested_date DATE NOT NULL,
  suggested_time TIME NOT NULL,
  professional_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  priority_score INTEGER DEFAULT 0, -- Baseado em proximidade, preferências do cliente
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Adicionar campos na tabela appointments para otimização
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS is_optimized BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS optimization_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gap_before_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gap_after_minutes INTEGER DEFAULT 0;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_schedule_settings_professional ON schedule_settings(professional_id);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_professional_date ON schedule_blocks(professional_id, block_date);
CREATE INDEX IF NOT EXISTS idx_reschedule_suggestions_appointment ON reschedule_suggestions(original_appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointments_optimization ON appointments(professional_id, appointment_date, is_optimized);