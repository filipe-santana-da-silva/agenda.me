-- Criar tabela para configuração do WhatsApp Business
CREATE TABLE IF NOT EXISTS public.whatsapp_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  business_name text,
  api_key text,
  api_url text,
  webhook_url text,
  is_active boolean DEFAULT false,
  auto_reply_enabled boolean DEFAULT false,
  welcome_message text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT whatsapp_config_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Criar índice para busca rápida
CREATE INDEX idx_whatsapp_config_active ON public.whatsapp_config(is_active);
