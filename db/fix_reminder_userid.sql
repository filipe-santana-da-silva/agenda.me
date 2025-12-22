-- Tornar coluna userid opcional na tabela Reminder
ALTER TABLE public."Reminder" ALTER COLUMN userid DROP NOT NULL;
