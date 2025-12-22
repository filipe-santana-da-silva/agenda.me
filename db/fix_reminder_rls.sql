-- Criar políticas RLS para tabela Reminder permitindo acesso total
DROP POLICY IF EXISTS "Enable all access for Reminder" ON public."Reminder";

CREATE POLICY "Enable all access for Reminder"
ON public."Reminder"
FOR ALL
USING (true)
WITH CHECK (true);
