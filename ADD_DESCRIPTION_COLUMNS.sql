-- Adicionar coluna description na tabela services (se não existir)
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS description text;

-- Adicionar coluna description na tabela employees (se não existir)
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS description text;

-- Atualizar descrições dos Serviços
UPDATE public.services
SET description = 'Corte de cabelo personalizado com tesoura e/ou máquina, realizado por nossos profissionais experientes.'
WHERE id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Corte de Cabelo';

UPDATE public.services
SET description = 'Aparação e finalização de barba com acabamento perfeito e produtos de qualidade.'
WHERE id = '550e8400-e29b-41d4-a716-446655440002' AND name = 'Barba';

UPDATE public.services
SET description = 'Aparação dos pelos da nuca e contorno do rosto para um acabamento limpo e preciso.'
WHERE id = '550e8400-e29b-41d4-a716-446655440003' AND name = 'Pézinho';

UPDATE public.services
SET description = 'Design e preenchimento de sobrancelha para um visual mais definido e harmonioso.'
WHERE id = '550e8400-e29b-41d4-a716-446655440004' AND name = 'Sobrancelha';

UPDATE public.services
SET description = 'Massagem relaxante para aliviar tensões e promover bem-estar físico e mental.'
WHERE id = '550e8400-e29b-41d4-a716-446655440005' AND name = 'Massagem';

UPDATE public.services
SET description = 'Tratamento hidratante intensivo para peles ressecadas e descamação, com produtos premium.'
WHERE id = '550e8400-e29b-41d4-a716-446655440006' AND name = 'Hidratação';

-- Atualizar descrições dos Profissionais
UPDATE public.employees
SET description = 'Profissional experiente em cortes modernos e barba. Especialista em design e acabamento de precisão.'
WHERE id = '650e8400-e29b-41d4-a716-446655440001' AND name = 'Vitor';

UPDATE public.employees
SET description = 'Barbeiro com expertise em tratamentos capilares. Conhecimento em diferentes estilos e técnicas de corte.'
WHERE id = '650e8400-e29b-41d4-a716-446655440002' AND name = 'Vinícius';

UPDATE public.employees
SET description = 'Profissional dedicado com foco em atendimento ao cliente e qualidade do serviço prestado.'
WHERE id = '650e8400-e29b-41d4-a716-446655440003' AND name = 'João Pedro';

UPDATE public.employees
SET description = 'Especialista em finalizações e acabamentos. Atento aos detalhes e satisfação do cliente.'
WHERE id = '650e8400-e29b-41d4-a716-446655440004' AND name = 'Carlos';

UPDATE public.employees
SET description = 'Profissional jovem e dinâmico com abordagem moderna em barbershop. Sempre atualizado com tendências.'
WHERE id = '650e8400-e29b-41d4-a716-446655440005' AND name = 'Lucas';
