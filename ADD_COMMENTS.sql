-- Adicionar descrições (comentários) nos Serviços
UPDATE public.services
SET 
  description = 'Corte de cabelo personalizado com tesoura e/ou máquina, realizado por nossos profissionais experientes.'
WHERE id = '550e8400-e29b-41d4-a716-446655440001';

UPDATE public.services
SET 
  description = 'Aparação e finalização de barba com acabamento perfeito e produtos de qualidade.'
WHERE id = '550e8400-e29b-41d4-a716-446655440002';

UPDATE public.services
SET 
  description = 'Aparação dos pelos da nuca e contorno do rosto para um acabamento limpo e preciso.'
WHERE id = '550e8400-e29b-41d4-a716-446655440003';

UPDATE public.services
SET 
  description = 'Design e preenchimento de sobrancelha para um visual mais definido e harmonioso.'
WHERE id = '550e8400-e29b-41d4-a716-446655440004';

UPDATE public.services
SET 
  description = 'Massagem relaxante para aliviar tensões e promover bem-estar físico e mental.'
WHERE id = '550e8400-e29b-41d4-a716-446655440005';

UPDATE public.services
SET 
  description = 'Tratamento hidratante intensivo para peles ressecadas e descamação, com produtos premium.'
WHERE id = '550e8400-e29b-41d4-a716-446655440006';

-- Adicionar informações adicionais nos Profissionais (employees)
UPDATE public.employees
SET 
  notes = 'Profissional experiente em cortes modernos e barba. Especialista em design e acabamento de precisão.'
WHERE id = '650e8400-e29b-41d4-a716-446655440001';

UPDATE public.employees
SET 
  notes = 'Barbeiro com expertise em tratamentos capilares. Conhecimento em diferentes estilos e técnicas de corte.'
WHERE id = '650e8400-e29b-41d4-a716-446655440002';

UPDATE public.employees
SET 
  notes = 'Profissional dedicado com foco em atendimento ao cliente e qualidade do serviço prestado.'
WHERE id = '650e8400-e29b-41d4-a716-446655440003';

UPDATE public.employees
SET 
  notes = 'Especialista em finalizações e acabamentos. Atento aos detalhes e satisfação do cliente.'
WHERE id = '650e8400-e29b-41d4-a716-446655440004';

UPDATE public.employees
SET 
  notes = 'Profissional jovem e dinâmico com abordagem moderna em barbershop. Sempre atualizado com tendências.'
WHERE id = '650e8400-e29b-41d4-a716-446655440005';
