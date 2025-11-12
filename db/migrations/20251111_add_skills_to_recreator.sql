-- Migration: add skills jsonb column to Recreator table
-- Date: 2025-11-11

ALTER TABLE "Recreator"
  ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '{}'::jsonb;

-- Optional: add a check constraint to ensure each skill level is an integer 0..5
-- Uncomment and apply only if you want DB-level validation (note: careful with existing rows)
-- ALTER TABLE "Recreator"
--   ADD CONSTRAINT check_recreator_skills_levels CHECK (
--     (skills->>'recreacao') IS NULL OR ((skills->>'recreacao')::int BETWEEN 0 AND 5)
--     AND ((skills->>'pintura') IS NULL OR ((skills->>'pintura')::int BETWEEN 0 AND 5))
--     AND ((skills->>'balonismo') IS NULL OR ((skills->>'balonismo')::int BETWEEN 0 AND 5))
--     AND ((skills->>'oficina') IS NULL OR ((skills->>'oficina')::int BETWEEN 0 AND 5))
--   );
