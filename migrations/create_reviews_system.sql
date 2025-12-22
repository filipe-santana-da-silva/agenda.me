-- Sistema de Avaliações
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  professional_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
  punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
  cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5),
  would_recommend BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges de qualidade para profissionais
CREATE TABLE IF NOT EXISTS professional_badges (
  id SERIAL PRIMARY KEY,
  professional_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL, -- 'excellent_service', 'punctual', 'clean', 'recommended'
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Adicionar campos na tabela appointments para controle de feedback
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS feedback_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS feedback_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reviews_professional ON reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_appointment ON reviews(appointment_id);
CREATE INDEX IF NOT EXISTS idx_badges_professional ON professional_badges(professional_id);